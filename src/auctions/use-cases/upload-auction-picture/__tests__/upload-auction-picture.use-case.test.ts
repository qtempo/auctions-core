import { describe, it, before } from 'node:test'
import { ok } from 'node:assert'
import { UUID, randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'

import { AuctionsError } from '@core/auctions.error'
import { MockAuctionRepository, MockFileUploadRepository } from '@auctions/repositories'

import { AuctionUploadPictureError } from '../auction-upload-picture.error'
import { UploadAuctionPictureRequest } from '../upload-auction-picture.request'
import { UploadAuctionPictureUseCase } from '../upload-auction-picture.use-case'

const executeUseCase = async (args: UploadAuctionPictureRequest) => {
  const useCase = new UploadAuctionPictureUseCase(
    new MockAuctionRepository(),
    new MockFileUploadRepository(),
  )
  return await useCase.execute(args)
}

describe('upload-auction-picture.use-case', () => {
  let testPictureBase64 = ''

  before(async () => {
    testPictureBase64 = await fs.readFile(__dirname + '/signal.jpg', { encoding: 'base64' })
  })

  it('should fail on auction id verification', async () => {
    const result = await executeUseCase({
      id: (randomUUID() + '123123') as UUID,
      seller: '',
      pictureBase64: '',
    })

    ok(result.isLeft(), 'execution must be failed')
    ok(result.value.name === AuctionsError.name, 'execution returns wrong error type')
    ok(result.value.message === 'provide a proper auction "id"', 'wrong error message')
  })

  it('should fail if upload made not buy a seller', async () => {
    const result = await executeUseCase({
      id: randomUUID(),
      seller: 'not-seller',
      pictureBase64: '',
    })

    ok(result.isLeft(), 'execution must be failed')
    ok(result.value.name === AuctionUploadPictureError.name, 'execution returns wrong error type')
    ok(result.value.message === 'Only seller allowed to perform this action.', 'wrong error message')
  })

  it('should fail on picture validation', async () => {
    const result = await executeUseCase({
      id: randomUUID(),
      seller: 'seller',
      pictureBase64: testPictureBase64 + 'qwerty',
    })

    ok(result.isLeft(), 'execution must be failed')
    ok(result.value.name === AuctionUploadPictureError.name, 'execution returns wrong error type')
    ok(result.value.message === 'Invalid base64 image.', 'wrong error message')
  })

  it('should fail on picture validation', async () => {
    const auctionID = randomUUID()
    const result = await executeUseCase({
      id: auctionID,
      seller: 'seller',
      pictureBase64: testPictureBase64,
    })

    ok(result.isRight(), 'execution must be fulfilled')
    ok(result.value.id === auctionID, 'id must be the same')
  })
})
