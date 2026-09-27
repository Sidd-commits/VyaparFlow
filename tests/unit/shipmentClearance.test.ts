import { evaluateShipmentClearance } from '@/lib/services/shipmentClearance';

describe('Shipment Dispatch Compliance Clearance Algorithm Tests', () => {
  it('throws error when shipment ID does not exist', async () => {
    await expect(evaluateShipmentClearance('non-existent-shipment-id')).rejects.toThrow(
      'Shipment record not found'
    );
  });
});
