'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/client';
import { revalidatePath } from 'next/cache';

export async function removeCategoryAction(id) {
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      message: 'Unauthorized: You must be logged in to create a post',
    };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return {
        success: false,
        message: 'Category not found',
      };
    }

    await prisma.$transaction([
      prisma.project.deleteMany({
        where: {
          categoryId: id,
        },
      }),
      prisma.category.delete({
        where: { id },
      }),
    ]);

    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'Category and associated projects deleted successfully',
    };
  } catch (error) {
    console.error('Error removing category and projects:', error);
    return {
      success: false,
      message: 'Failed to delete category and projects. Please try again.',
    };
  }
}
