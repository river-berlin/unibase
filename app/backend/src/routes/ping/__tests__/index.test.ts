import request from 'supertest';
import { app } from '../../../app';
import { describe, it, expect } from '@jest/globals';

describe('Ping Route', () => {
  it('should return pong', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
    expect(response.type).toBe('application/json');
    
    const body = JSON.parse(response.text);
    expect(body).toHaveProperty('message', 'pong');
    expect(body).toHaveProperty('timestamp');
    expect(new Date(body.timestamp)).toBeInstanceOf(Date);
  });
}); 

export = {}