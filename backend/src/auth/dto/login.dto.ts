import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(25)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{5,25}/)
  password: string;
}
