import { IsArray, IsBoolean, IsObject, IsOptional } from 'class-validator';

export class BoardShareDto {
  @IsBoolean()
  isShared!: boolean;
}

export class BoardUpdateDto {
  @IsArray()
  elements!: unknown[];

  @IsOptional()
  @IsObject()
  appState?: Record<string, unknown>;
}
