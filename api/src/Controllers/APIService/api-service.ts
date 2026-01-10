import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import Bottleneck from 'bottleneck';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class APIService {
  private limiter: Bottleneck;

  constructor(private readonly httpService: HttpService) {
    this.limiter = new Bottleneck({
      maxConcurrent: 5, // Adjust as needed
      minTime: 100, // Adjust as needed
    });
  }

  async makeApiCall<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.limiter.schedule(async () => {
      const response = await firstValueFrom(
        this.httpService.request<T>(config).pipe(
          catchError((error: AxiosError) => {
            console.error('API call error:', error)
            throw error.response?.data || {
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data
            }
          }),
        ),
      );
      return response;
    });
  }

  async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method: 'POST',
        url,
        data,
        ...config,
      };
      return this.makeApiCall<T>(requestConfig);
    } catch (error) {
      console.error('Error in POST request:', error);
      throw error;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        url,
        ...config,
      };
      return this.makeApiCall<T>(requestConfig);
    } catch (error) {
      console.error('Error in GET request:', error);
      throw error;
    }
  }

  async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method: 'PUT',
        url,
        data,
        ...config,
      };
      return this.makeApiCall<T>(requestConfig);
    } catch (error) {
      console.error('Error in PUT request:', error);
      throw error;
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method: 'DELETE',
        url,
        ...config,
      };
      return this.makeApiCall<T>(requestConfig);
    } catch (error) {
      console.error('Error in DELETE request:', error);
      throw error;
    }
  }

  async patch<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        method: 'PATCH',
        url,
        data,
        ...config,
      };
      return this.makeApiCall<T>(requestConfig);
    } catch (error) {
      console.error('Error in PATCH request:', error);
      throw error;
    }
  }


}
