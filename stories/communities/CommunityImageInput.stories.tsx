import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'
import { CommunityImageInput } from '@/components/communities/CommunityImageInput'

const meta = {
  title: 'Communities/CommunityImageInput',
  component: CommunityImageInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
  args: {
    value: null,
    onChange: fn(),
  },
} satisfies Meta<typeof CommunityImageInput>

export default meta
type Story = StoryObj<typeof meta>

// Estado inicial — sin imagen, tab "Subir archivo"
export const Vacio: Story = {}

// Tab URL visible — sin imagen
export const TabUrl: Story = {
  play: async ({ canvasElement }) => {
    const { within, userEvent } = await import('storybook/test')
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('Desde URL'))
  },
}

// Con imagen ya seleccionada (preview)
export const ConImagen: Story = {
  args: {
    value: 'https://picsum.photos/seed/community/80/80',
  },
}

// Estado subiendo — simula el botón de archivo en estado loading
export const Subiendo: Story = {
  render: (args) => {
    // Simulamos estado uploading con un wrapper mínimo
    return (
      <div style={{ width: 300 }}>
        <CommunityImageInput {...args} />
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 8 }}>
          (El estado &quot;subiendo&quot; se activa al seleccionar un archivo)
        </p>
      </div>
    )
  },
}
