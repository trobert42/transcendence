import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EditUserDto {
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

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(15)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{4,14}$/)
  username: string;

  @IsBoolean()
  isDoneRegister: boolean;
}

export class EditUserFirstLoginDto {
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

  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(15)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{4,14}$/)
  username: string;

  @IsBoolean()
  isDoneRegister: boolean;
}
