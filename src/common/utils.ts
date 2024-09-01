import { existsSync } from 'fs';

export type KeyOptionsType = 'generate' | 'manual' | 'upload';
export type KeyUseType = 'signature' | 'encryption';
export type KeyType = 'OCT' | 'RSA';

export function isNullOrEmpty(input: any): boolean {
    return input == null || input === ''
};

export function fileExistsAsync(path: string): boolean {
    return existsSync(path)
}