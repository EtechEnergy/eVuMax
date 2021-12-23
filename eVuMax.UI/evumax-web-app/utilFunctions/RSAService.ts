import * as CryptoTS from "crypto-ts";

export class RSAService {
  private static key = CryptoTS.enc.Utf8.parse("!@#$%^sFxH&+58~A");

  private static Iv = CryptoTS.enc.Utf8.parse("!@#$%^sFxH&+58~A");

  /**
   *
   * @param value string value
   * @returns
   */
  static Encryption(value: string): string {
    const utf8String = CryptoTS.enc.Utf8.parse(value);
    return CryptoTS.AES.encrypt(utf8String, RSAService.key, {
      iv: RSAService.Iv,
      mode: CryptoTS.mode.CBC,
      padding: CryptoTS.pad.PKCS7,
    }) as unknown as string;
  }

  /**
   *
   * @param value
   * @returns
   */
  static Decryption(value: string): string {
    const bytes = CryptoTS.AES.decrypt(value.toString(), RSAService.key, {
      iv: RSAService.Iv,
      mode: CryptoTS.mode.CBC,
      padding: CryptoTS.pad.PKCS7,
    });
    return bytes.toString(CryptoTS.enc.Utf8);
  }

  /**
   *
   * @param value
   * @returns
   */
  static EncryptionToBas64(value: string): string {
    const utf8String = CryptoTS.enc.Utf8.parse(value);
    let encryptredString: string = "";

    encryptredString = CryptoTS.AES.encrypt(utf8String, RSAService.key, {
      iv: RSAService.Iv,
      mode: CryptoTS.mode.CBC,
      padding: CryptoTS.pad.PKCS7,
    }) as unknown as string;

    console.log(encryptredString);
    console.log(btoa(encryptredString));
    return btoa(encryptredString);
  }
}
