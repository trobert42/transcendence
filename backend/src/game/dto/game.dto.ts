import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

export class PaddleMoveDto {
	@IsNotEmpty()
	@IsNumber()
	userId: number;

	@IsNotEmpty()
	@IsString()
	type: string;
}
