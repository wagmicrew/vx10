import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to get settings from database
export const getSettings = async (category?: string) => {
  const where = category ? { category } : {}
  const settings = await prisma.settings.findMany({ where })
  
  return settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = {}
    }
    acc[setting.category][setting.key] = setting.value
    return acc
  }, {} as Record<string, Record<string, string>>)
}

// Helper function to set a setting
export const setSetting = async (category: string, key: string, value: string, description?: string) => {
  return await prisma.settings.upsert({
    where: { category_key: { category, key } },
    update: { value, description, updatedAt: new Date() },
    create: { category, key, value, description }
  })
}
