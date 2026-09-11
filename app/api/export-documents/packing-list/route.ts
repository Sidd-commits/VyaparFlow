import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePackingListPDF } from '@/lib/services/documentGenerator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shipmentId = searchParams.get('shipmentId');

  if (!shipmentId) {
    return NextResponse.json({ error: 'Shipment ID required' }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      business: true,
      product: true,
      destinationCountry: true,
    },
  });

  if (!shipment) {
    return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
  }

  const pdfBuffer = generatePackingListPDF({
    invoiceNumber: `INV-${shipment.shipmentNumber}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    exporterName: shipment.business.legalName,
    exporterAddress: `${shipment.business.location}, ${shipment.business.city}, ${shipment.business.state}`,
    exporterGst: shipment.business.gstStatus,
    exporterIec: shipment.business.iecStatus,
    consigneeName: 'Gulf Food Distribution LLC',
    consigneeAddress: `Al Quoz Industrial Area 4, ${shipment.destinationCity}, ${shipment.destinationCountry.name}`,
    destinationCountry: shipment.destinationCountry.name,
    portOfLoading: 'JNPT Port, Mumbai, India',
    portOfDischarge: `${shipment.destinationCity} Port`,
    productName: shipment.product.name,
    hsCode: shipment.product.hsCode,
    quantity: shipment.quantity,
    unit: shipment.product.unit,
    unitPrice: Math.round(shipment.value / shipment.quantity),
    totalValue: shipment.value,
    currency: shipment.currency,
    paymentTerms: '100% L/C at Sight',
    weight: shipment.weight,
    packages: shipment.packages,
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Packing_List_${shipment.shipmentNumber}.pdf"`,
    },
  });
}
