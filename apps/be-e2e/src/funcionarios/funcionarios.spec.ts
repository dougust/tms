import axios from 'axios';

describe('Funcionarios API', () => {
  let createdFuncionarioId: string;
  const testBusinessId = 'test-tenant-001';

  // Test data
  const createFuncionarioDto = {
    nome: 'João da Silva',
    social: 'João Silva',
    cpf: '12345678901',
    nascimento: '1990-05-15',
    phone: '+5511999999999',
    email: 'joao.silva.test@example.com',
    rg: '123456789',
  };

  describe('POST /api/funcionarios', () => {
    it('should create a new funcionario with cadastro', async () => {
      const res = await axios.post('/api/funcionarios', createFuncionarioDto);

      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('cadastro');
      expect(res.data.cadastro.email).toBe(createFuncionarioDto.email);
      expect(res.data.cadastro.cpfCnpj).toBe(createFuncionarioDto.cpf);
      expect(res.data.cadastro.nomeRazao).toBe(createFuncionarioDto.nome);

      // Save the created ID for other tests
      createdFuncionarioId = res.data.id;
    });

    it('should fail when required fields are missing', async () => {
      try {
        await axios.post('/api/funcionarios', {
          nome: 'Test Without Email',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fail when email is invalid', async () => {
      try {
        await axios.post('/api/funcionarios', {
          ...createFuncionarioDto,
          email: 'invalid-email',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET /api/funcionarios', () => {
    it('should return all funcionarios', async () => {
      const res = await axios.get('/api/funcionarios');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0]).toHaveProperty('funcionario');
      expect(res.data[0]).toHaveProperty('cadastro');
    });
  });

  describe('GET /api/funcionarios/:id', () => {
    it('should return a single funcionario by id', async () => {
      const res = await axios.get(`/api/funcionarios/${createdFuncionarioId}`);

      expect(res.status).toBe(200);
      expect(res.data.funcionario).toHaveProperty('id', createdFuncionarioId);
      expect(res.data).toHaveProperty('cadastro');
      expect(res.data.cadastro.email).toBe(createFuncionarioDto.email);
    });

    it('should return 404 for non-existent funcionario', async () => {
      try {
        await axios.get(
          '/api/funcionarios/00000000-0000-0000-0000-000000000000'
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should filter by businessId when provided', async () => {
      const res = await axios.get(`/api/funcionarios/${createdFuncionarioId}`, {
        params: { businessId: testBusinessId },
      });

      expect(res.status).toBe(200);
      expect(res.data.funcionario).toHaveProperty('id', createdFuncionarioId);
    });
  });

  describe('PATCH /api/funcionarios/:id', () => {
    it('should update funcionario cadastro fields', async () => {
      const updateDto = {
        nome: 'João da Silva Santos',
        phone: '+5511988888888',
      };

      const res = await axios.patch(
        `/api/funcionarios/${createdFuncionarioId}`,
        updateDto
      );

      expect(res.status).toBe(200);
      expect(res.data.cadastro.nomeRazao).toBe(updateDto.nome);
      expect(res.data.cadastro.phone).toBe(updateDto.phone);
    });

    it('should update only email', async () => {
      const updateDto = {
        email: 'joao.updated@example.com',
      };

      const res = await axios.patch(
        `/api/funcionarios/${createdFuncionarioId}`,
        updateDto
      );

      expect(res.status).toBe(200);
      expect(res.data.cadastro.email).toBe(updateDto.email);
    });

    it('should return 404 when updating non-existent funcionario', async () => {
      try {
        await axios.patch(
          '/api/funcionarios/00000000-0000-0000-0000-000000000000',
          {
            nome: 'Test',
          }
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should handle empty update', async () => {
      const res = await axios.patch(
        `/api/funcionarios/${createdFuncionarioId}`,
        {}
      );

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('cadastro');
    });
  });

  describe('DELETE /api/funcionarios/:id', () => {
    it('should delete a funcionario', async () => {
      const res = await axios.delete(
        `/api/funcionarios/${createdFuncionarioId}`
      );

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('id', createdFuncionarioId);
    });

    it('should return 404 when funcionario not found after deletion', async () => {
      try {
        await axios.get(`/api/funcionarios/${createdFuncionarioId}`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 when deleting non-existent funcionario', async () => {
      try {
        await axios.delete(
          '/api/funcionarios/00000000-0000-0000-0000-000000000000'
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should filter by businessId when provided', async () => {
      // First create a funcionario to delete
      const createRes = await axios.post('/api/funcionarios', {
        ...createFuncionarioDto,
        email: 'delete.test@example.com',
        cpf: '98765432109',
      });

      const idToDelete = createRes.data.id;

      const deleteRes = await axios.delete(`/api/funcionarios/${idToDelete}`, {
        params: { businessId: testBusinessId },
      });

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.data).toHaveProperty('id', idToDelete);
    });
  });

  describe('Duplicate validation', () => {
    it('should return 400 when creating with duplicate CPF', async () => {
      // First create a funcionario
      const firstDto = {
        cpf: '55555555555',
        email: 'first.duplicate@example.com',
      };
      const firstRes = await axios.post('/api/funcionarios', firstDto);
      const firstId = firstRes.data.id;

      // Try to create another with the same CPF
      try {
        await axios.post('/api/funcionarios', {
          cpf: '55555555555',
          email: 'different@example.com',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('CPF ja cadastrado');
      }

      // Cleanup
      await axios.delete(`/api/funcionarios/${firstId}`);
    });

    it('should return 400 when creating with duplicate email', async () => {
      // First create a funcionario
      const firstDto = {
        cpf: '66666666666',
        email: 'duplicate.email@example.com',
      };
      const firstRes = await axios.post('/api/funcionarios', firstDto);
      const firstId = firstRes.data.id;

      // Try to create another with the same email
      try {
        await axios.post('/api/funcionarios', {
          cpf: '77777777777',
          email: 'duplicate.email@example.com',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Email ja cadastrado');
      }

      // Cleanup
      await axios.delete(`/api/funcionarios/${firstId}`);
    });

    it('should return 400 when updating to a duplicate CPF', async () => {
      // Create two funcionarios
      const first = await axios.post('/api/funcionarios', {
        cpf: '88888888888',
        email: 'update1@example.com',
      });
      const second = await axios.post('/api/funcionarios', {
        cpf: '99999999999',
        email: 'update2@example.com',
      });

      // Try to update second to have first's CPF
      try {
        await axios.patch(`/api/funcionarios/${second.data.id}`, {
          cpf: '88888888888',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('CPF ja cadastrado');
      }

      // Cleanup
      await axios.delete(`/api/funcionarios/${first.data.id}`);
      await axios.delete(`/api/funcionarios/${second.data.id}`);
    });

    it('should return 400 when updating to a duplicate email', async () => {
      // Create two funcionarios
      const first = await axios.post('/api/funcionarios', {
        cpf: '44444444444',
        email: 'update-email1@example.com',
      });
      const second = await axios.post('/api/funcionarios', {
        cpf: '55555555556',
        email: 'update-email2@example.com',
      });

      // Try to update second to have first's email
      try {
        await axios.patch(`/api/funcionarios/${second.data.id}`, {
          email: 'update-email1@example.com',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Email ja cadastrado');
      }

      // Cleanup
      await axios.delete(`/api/funcionarios/${first.data.id}`);
      await axios.delete(`/api/funcionarios/${second.data.id}`);
    });
  });

  describe('Data validation', () => {
    it('should validate date format for nascimento', async () => {
      try {
        await axios.post('/api/funcionarios', {
          ...createFuncionarioDto,
          nascimento: 'invalid-date',
          email: 'date.test@example.com',
          cpf: '11111111111',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle optional fields correctly', async () => {
      const minimalDto = {
        cpf: '22222222222',
        email: 'minimal.test@example.com',
      };

      const res = await axios.post('/api/funcionarios', minimalDto);

      expect(res.status).toBe(201);
      expect(res.data.cadastro.email).toBe(minimalDto.email);
      expect(res.data.cadastro.cpfCnpj).toBe(minimalDto.cpf);
      expect(res.data.cadastro.nomeRazao).toBeNull();

      // Cleanup
      await axios.delete(`/api/funcionarios/${res.data.id}`);
    });

    it('should validate rg length', async () => {
      try {
        await axios.post('/api/funcionarios', {
          ...createFuncionarioDto,
          rg: '123456789012', // Too long (max 11)
          email: 'rg.test@example.com',
          cpf: '33333333333',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });
});
