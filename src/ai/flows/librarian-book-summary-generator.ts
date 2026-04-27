'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating book summaries and key themes.
 *
 * - generateBookSummary - A function that generates a concise summary and identifies key themes for a book.
 * - LibrarianBookSummaryGeneratorInput - The input type for the generateBookSummary function.
 * - LibrarianBookSummaryGeneratorOutput - The return type for the generateBookSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LibrarianBookSummaryGeneratorInputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  description: z.string().describe('A detailed description of the book content.'),
});
export type LibrarianBookSummaryGeneratorInput = z.infer<typeof LibrarianBookSummaryGeneratorInputSchema>;

const LibrarianBookSummaryGeneratorOutputSchema = z.object({
  summary: z.string().describe('A concise and engaging summary of the book.'),
  keyThemes: z.array(z.string()).describe('A list of key themes or topics present in the book.'),
});
export type LibrarianBookSummaryGeneratorOutput = z.infer<typeof LibrarianBookSummaryGeneratorOutputSchema>;

export async function generateBookSummary(
  input: LibrarianBookSummaryGeneratorInput
): Promise<LibrarianBookSummaryGeneratorOutput> {
  return librarianBookSummaryGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'librarianBookSummaryPrompt',
  input: {schema: LibrarianBookSummaryGeneratorInputSchema},
  output: {schema: LibrarianBookSummaryGeneratorOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing book details and extracting key information.
Your task is to generate a concise, engaging summary and identify key themes for a given book.

Here are the book details:
Title: {{{title}}}
Author: {{{author}}}
Description: {{{description}}}

Based on the provided information, generate a compelling summary and a list of 3-5 key themes that accurately reflect the book's content. The summary should be suitable for a library catalog to help members discover relevant books.`,
});

const librarianBookSummaryGeneratorFlow = ai.defineFlow(
  {
    name: 'librarianBookSummaryGeneratorFlow',
    inputSchema: LibrarianBookSummaryGeneratorInputSchema,
    outputSchema: LibrarianBookSummaryGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
