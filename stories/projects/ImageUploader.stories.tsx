import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ImageUploader } from '@/components/projects/ImageUploader'
import type { UploaderImage } from '@/components/projects/ImageUploader'

const meta: Meta<typeof ImageUploader> = {
  title: 'Projects/ImageUploader',
  component: ImageUploader,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ImageUploader>

const sampleImages: UploaderImage[] = [
  {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200',
    path: 'user-1/temp/image1.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200',
    path: 'user-1/temp/image2.jpg',
  },
]

function SinImagenesTemplate() {
  const [images, setImages] = useState<UploaderImage[]>([])
  return <ImageUploader images={images} onImagesChange={setImages} maxImages={3} />
}

function ConDosImagenesTemplate() {
  const [images, setImages] = useState<UploaderImage[]>(sampleImages)
  return <ImageUploader images={images} onImagesChange={setImages} maxImages={3} />
}

function LimiteAlcanzadoTemplate() {
  const [images, setImages] = useState<UploaderImage[]>([
    ...sampleImages,
    {
      url: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=200',
      path: 'user-1/temp/image3.jpg',
    },
  ])
  return <ImageUploader images={images} onImagesChange={setImages} maxImages={3} />
}

export const SinImagenes: Story = {
  render: () => <SinImagenesTemplate />,
}

export const ConDosImagenes: Story = {
  render: () => <ConDosImagenesTemplate />,
}

export const LimiteAlcanzado: Story = {
  render: () => <LimiteAlcanzadoTemplate />,
}
