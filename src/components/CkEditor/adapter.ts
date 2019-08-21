import { Api, Liitetiedostot } from '@/api';
import Axios from 'axios';

export class EpUploadAdapter {
  private loader: any;
  private params: any;
  private cancelTokenSource: any;

  constructor(loader, params) {
    this.loader = loader;
    this.params = params;
  }

  public async upload() {
    const file = await this.loader.file;

    try {
      const { width, height } = await this.readSize(file);

      const formData = new FormData();
      formData.append('file', file);

      const res = await Api.post(`/opetussuunnitelmat/${this.params.opsId}/kuvat`,
        formData,
        this.createAxiosConfig(this.params.nimi || file.name, width, height));

      return {
        default: res.headers.location
      };
    }
    catch (err) {
      return Promise.reject(new Error('Error happened while reading editor image'));
    }
  }

  public abort() {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel();
    }
  }

  private createAxiosConfig(nimi, width, height) {
    this.cancelTokenSource = Axios.CancelToken.source();
    return {
      params: {
        nimi,
        width,
        height,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      cancelToken: this.cancelTokenSource.token,
      onUploadProgress: (progressEvent) => {
        this.loader.uploadTotal = progressEvent.total;
        this.loader.uploaded = progressEvent.loaded;
      },
    };
  }

  private async readSize(image) {
    const img: any = new Image();
    img.src = await this.readUploadedImage(image);

    const width = img.width;
    const height = img.height;

    return { width, height };
  }

  private readUploadedImage(image) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        resolve(event.target.result);
      };

      reader.onerror = (e) => {
        reader.abort();
        reject(e);
      };

      reader.readAsDataURL(image);
    });
  }
}
