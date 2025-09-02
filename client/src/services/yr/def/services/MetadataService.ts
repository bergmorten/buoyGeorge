/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from '../core/request';

export class MetadataService {
  /**
   * Schema for XML data
   * @returns any OK
   * @throws ApiError
   */
  public static async getMetadataService(): Promise<any> {
    const result = await __request({
      method: 'GET',
      path: `/schema`,
    });
    return result.body;
  }

  /**
   * Check health status for product
   * @returns any OK
   * @throws ApiError
   */
  public static async getMetadataService1(): Promise<any> {
    const result = await __request({
      method: 'GET',
      path: `/healthz`,
    });
    return result.body;
  }
}
