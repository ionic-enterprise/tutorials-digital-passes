import { Injectable } from '@angular/core';
import { CapacitorPassToWallet } from 'capacitor-pass-to-wallet';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  public async get(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    if (!base64 || base64 instanceof ArrayBuffer) {
      throw new Error(`Unable to get ${url}`);
    }
    return base64;
  }

  public async addToWallet(data: string) {
    await CapacitorPassToWallet.addToWallet({ base64: data });    
  }
}

function blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
