import { execSync } from 'node:child_process';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be able to can create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'new Transaction',
      amount: 5000,
      type: 'credit',
    });
    expect(response.statusCode).toEqual(201);
  });

  it('should be able to list all transactions', async () => {
    const createTransacationResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'new Transaction',
        amount: 5000,
        type: 'credit',
      });
    const cookies = createTransacationResponse.get('Set-Cookie');
    const response = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      transactions: [
        expect.objectContaining({
          title: 'new Transaction',
          amount: 5000,
        }),
      ],
    });
  });

  it('should be able to get a specific tranasactions', async () => {
    const createTransacationResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit',
      });
    const cookies = createTransacationResponse.get('Set-Cookie');
    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);
    const transactionid = listTransactionsResponse.body.transactions[0].id;
    const response = await request(app.server)
      .get(`/transactions/${transactionid}`)
      .set('Cookie', cookies);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      transaction: expect.objectContaining({
        id: transactionid,
        title: 'New Transaction',
        amount: 5000,
      }),
    });
  });

  it('should be able to get the summary', async () => {
    const createTransacationResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit Transaction',
        amount: 5000,
        type: 'credit',
      });
    const cookies = createTransacationResponse.get('Set-Cookie');
    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit Transaction',
        amount: 800,
        type: 'debit',
      });

    const response = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies);

    expect(response.statusCode).toEqual(200);
    expect(response.body.summary).toEqual({ amount: 4200 });
  });
});
