import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(25)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{5,25}/)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @Matches(/^[a-zA-Z\- ]{1,30}$/)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  @Matches(/^[a-zA-Z\- ]{1,30}$/)
  lastname: string;

  @IsOptional()
  access42Token?: string;
}
