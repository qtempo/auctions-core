import { AuctionID } from '../entities/Auction'

export class AuctionNotFoundError extends Error {
  name: 'AuctionNotFoundError' = 'AuctionNotFoundError'

  constructor(id: AuctionID) {
    super(`auction with id: ${id} doesn't exist`)
  }
}
