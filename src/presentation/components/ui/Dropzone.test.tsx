import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropzone } from '@/src/presentation/components/ui/Dropzone';
import { uploadToCloudinary } from '@/src/shared/utils/cloudinary';

jest.mock('@/src/shared/utils/cloudinary', () => ({
  uploadToCloudinary: jest.fn(),
}));

const uploadMock = uploadToCloudinary as jest.MockedFunction<typeof uploadToCloudinary>;

const STORED_LOGO = 'https://res.cloudinary.com/demo/image/upload/v1/logos/acme.png';

/** `File.size` es de solo lectura, así que se define para poder probar el límite. */
function fileOf(name: string, type: string, sizeBytes: number): File {
  const file = new File(['contenido'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

function renderDropzone(props: Partial<React.ComponentProps<typeof Dropzone>> = {}) {
  const onChange = jest.fn();
  render(<Dropzone label="Logo" onChange={onChange} {...props} />);
  return { onChange, input: screen.getByLabelText('Logo') as HTMLInputElement };
}

describe('Dropzone', () => {
  it('expone el disparador como un botón real, no como un div con rol', () => {
    renderDropzone();

    const trigger = screen.getByRole('button', { name: /haz clic para elegir/i });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('type', 'button');
  });

  it('abre el selector de archivos con Enter, sin manejador propio', async () => {
    const clickSpy = jest.spyOn(HTMLInputElement.prototype, 'click');
    renderDropzone();

    // Se enfoca el botón explícitamente en vez de tabular: jsdom no aplica Tailwind, así que
    // el `hidden` del input no existe y el orden de tabulación no refleja el del navegador.
    // Lo que importa es que la activación por teclado sea la nativa del botón.
    const trigger = screen.getByRole('button', { name: /haz clic para elegir/i });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockClear();
    await userEvent.keyboard(' ');
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('no abre el selector cuando está deshabilitado', async () => {
    const clickSpy = jest.spyOn(HTMLInputElement.prototype, 'click');
    renderDropzone({ disabled: true });

    const trigger = screen.getByRole('button', { name: /haz clic para elegir/i });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger, { pointerEventsCheck: 0 });

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('rechaza un formato no permitido al soltarlo', async () => {
    // El rechazo por MIME solo es alcanzable por arrastre: `userEvent.upload` respeta el
    // atributo `accept` y filtra el archivo antes de que llegue al componente, igual que el
    // navegador cuando se elige desde el diálogo.
    const { onChange, input } = renderDropzone();
    const zone = input.closest('fieldset');
    expect(zone).not.toBeNull();

    fireEvent.drop(zone as HTMLElement, {
      dataTransfer: { files: [fileOf('contrato.pdf', 'application/pdf', 1024)], types: ['Files'] },
    });

    expect(await screen.findByText(/formato no permitido/i)).toBeInTheDocument();
    expect(uploadMock).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rechaza un archivo que supera el tamaño máximo', async () => {
    const { input } = renderDropzone({ maxSizeMB: 1 });
    await userEvent.upload(input, fileOf('logo.png', 'image/png', 2 * 1024 * 1024));

    expect(await screen.findByText(/supera el tamaño máximo de 1MB/i)).toBeInTheDocument();
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('sube un archivo válido y reporta la URL resultante', async () => {
    uploadMock.mockResolvedValue({
      secureUrl: STORED_LOGO,
      publicId: 'logos/acme',
      bytes: 512,
    });
    const { onChange, input } = renderDropzone();

    await userEvent.upload(input, fileOf('logo.png', 'image/png', 512));

    expect(uploadMock).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(STORED_LOGO);
  });

  it('informa el error cuando la subida falla', async () => {
    uploadMock.mockRejectedValue(new Error('La nube rechazó el archivo'));
    const { onChange, input } = renderDropzone();

    await userEvent.upload(input, fileOf('logo.png', 'image/png', 512));

    expect(await screen.findByText('La nube rechazó el archivo')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('muestra el logo ya guardado y permite quitarlo', async () => {
    const { onChange } = renderDropzone({ value: STORED_LOGO });

    expect(screen.getByRole('img', { name: 'Vista previa' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Quitar imagen' }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('no anida el botón de quitar dentro del disparador', () => {
    renderDropzone({ value: STORED_LOGO });

    const trigger = screen.getByRole('button', { name: 'Cambiar imagen' });
    expect(within(trigger).queryByRole('button')).toBeNull();
  });

  it('usa el input de archivo como control etiquetado', () => {
    const { input } = renderDropzone();

    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/png,image/jpeg,image/webp');
  });
});
