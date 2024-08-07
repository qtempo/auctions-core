import { Auction } from '@core/entities'

export type UploadAuctionPictureRequest = Pick<Auction, 'id' | 'seller'> & {
  pictureBase64: string
}