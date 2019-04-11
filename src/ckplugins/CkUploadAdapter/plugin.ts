import { Api, baseURL } from '@/api';
import Axios from 'axios';

export class CkUploadAdapter {
  loader: any = null;
  opsId: number = 0;
  cancelTokenSource: any = null;

  constructor(loader, opsId) {
    this.loader = loader;
    this.opsId = opsId;
  }

  readUploadedImage(image) {
    const fr = new FileReader();
    return new Promise((resolve, reject) => {
      fr.onerror = () => {
        fr.abort();
        reject(new Error('Error while reading image size'));
      };

      fr.onload = () => {
        if (!fr.result) {
          reject(new Error('Error while reading image size'));
        }
        else {
          resolve(fr.result);
        }
      };
      fr.readAsDataURL(image);
    });
  }

  async readSize(image) {
    let width = 0;
    let height = 0;
    const img = new Image();
    try {
      const data = await this.readUploadedImage(image);
      img.src = (data as string);
      width = img.width;
      height = img.height;
    }
    catch (err) {
      throw err;
    }
    return { width, height };
  }

  // Starts the upload process.
  async upload() {
    this.cancelTokenSource = Axios.CancelToken.source();

    try {
      const file = await this.loader.file;
      const nimi = file.name;
      const { width, height } = await this.readSize(file);

      var formData = new FormData();
      formData.append('file', file);

      const response = await Api.post(`/opetussuunnitelmat/${this.opsId}/kuvat`,
        formData, {
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
        }
      );

      return {
        default: `${baseURL}/opetussuunnitelmat/${this.opsId}/kuvat/${response.data}`,
      };
    }
    catch (err) {
      return Promise.reject(new Error('Error happened while reading editor image'));
    }
  }

  // Aborts the upload process.
  abort() {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel();
    }
  }
}
