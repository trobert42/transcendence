import { Injectable, BadRequestException } from "@nestjs/common";
import { FileFilterCallback } from "multer";
import { Request } from "express";
import * as fs from "fs";

@Injectable()
export class ImageFileFilter {
  private allowedImageTypes = ["image/jpeg", "image/png"];
  private jpegSignature = Buffer.from([0xff, 0xd8, 0xff]);
  private pngSignature = Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
  ]);

  async filter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): Promise<void> {
    if (this.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }

  async magicalNumbersChecker(
    req: Request,
    file: Express.Multer.File,
  ): Promise<boolean> {
    if (!file || !file.path) {
      throw new BadRequestException("No file uploaded");
    }

    const buffer = Buffer.alloc(8);
    const fd = await fs.promises.open(file.path, "r");
    await fd.read(buffer, 0, 8, 0);
    await fd.close();

    if (
      this.allowedImageTypes.includes(file.mimetype) &&
      (this.startsWith(buffer, this.jpegSignature) ||
        this.startsWith(buffer, this.pngSignature))
    ) {
      return true;
    } else {
      await fs.promises.unlink(file.path);
      return false;
    }
  }

  private startsWith(buffer: Buffer, signature: Buffer): boolean {
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }
    return true;
  }

  private async readFileInMemory(file: Express.Multer.File): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];

      file.stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      file.stream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      file.stream.on("error", (error) => {
        reject(error);
      });
    });
  }
}
