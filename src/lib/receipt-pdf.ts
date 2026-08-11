import { jsPDF } from 'jspdf';
import { PaymentRecord, Lead } from '@/types';
import { formatINR, formatDateIN } from './formatters';
import { BUSINESS_INFO } from './constants';

export function generatePaymentReceiptPDF(payment: PaymentRecord, lead?: Partial<Lead>): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const clientName = lead?.full_name || payment.lead_name || 'Valued Client';
  const clientPhone = lead?.phone || '';
  const clientCity = lead?.city || '';
  const receiptNo = `DS-REC-${payment.id.slice(0, 8).toUpperCase()}`;

  // Header Banner Background (Deep Navy #1A3C5E)
  doc.setFillColor(26, 60, 94);
  doc.rect(0, 0, 210, 45, 'F');

  // Gold Accent Line (#C9933A)
  doc.setFillColor(201, 147, 58);
  doc.rect(0, 45, 210, 3, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(BUSINESS_INFO.name, 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(BUSINESS_INFO.title, 15, 25);
  doc.text(`${BUSINESS_INFO.website} | ${BUSINESS_INFO.phone}`, 15, 31);

  // Receipt Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(201, 147, 58);
  doc.text('OFFICIAL RECEIPT', 145, 20);
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Receipt No: ${receiptNo}`, 145, 28);
  doc.text(`Date: ${formatDateIN(payment.payment_date)}`, 145, 34);

  // Section 1: Client & Payment Metadata
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIVED FROM:', 15, 60);
  doc.text('PAYMENT DETAILS:', 115, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${clientName}`, 15, 67);
  if (clientPhone) doc.text(`Phone: ${clientPhone}`, 15, 73);
  if (clientCity) doc.text(`City: ${clientCity}`, 15, 79);

  doc.text(`Payment Mode: ${payment.payment_mode.toUpperCase()}`, 115, 67);
  doc.text(`Payment Type: ${payment.payment_type.toUpperCase()}`, 115, 73);
  doc.text(`Ref / Txn No: ${payment.reference_no || 'N/A'}`, 115, 79);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 87, 195, 87);

  // Table Header
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 92, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text('Service Particulars', 20, 98.5);
  doc.text('Dakshina Amount (INR)', 150, 98.5);

  // Table Content
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(payment.service, 20, 110);
  doc.text(formatINR(payment.amount), 150, 110);

  // Notes if any
  if (payment.notes) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Notes: ${payment.notes}`, 20, 117);
  }

  // Summary Line
  doc.line(15, 125, 195, 125);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(26, 60, 94);
  doc.text('TOTAL AMOUNT PAID:', 105, 134);
  doc.setTextColor(46, 125, 50);
  doc.text(formatINR(payment.amount), 155, 134);

  // Payment Dues Status Box
  if (lead && (lead.full_amount || 0) > 0) {
    doc.setFillColor(254, 243, 199);
    doc.rect(15, 145, 180, 22, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.rect(15, 145, 180, 22, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('Account Financial Balance:', 20, 152);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Agreed Dakshina: ${formatINR(lead.full_amount)}`, 20, 159);
    doc.text(`Total Received: ${formatINR(lead.amount_paid)}`, 95, 159);
    doc.text(`Pending Balance Due: ${formatINR(lead.amount_due)}`, 145, 159);
  }

  // Spiritual Blessing / Footer
  const footerY = 220;
  doc.setFillColor(255, 248, 231);
  doc.rect(15, footerY, 180, 30, 'F');
  doc.setDrawColor(201, 147, 58);
  doc.rect(15, footerY, 180, 30, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9);
  doc.text('॥ ॐ नमो भगवते वासुदेवाय नमः ॥', 105, footerY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Thank you for your trust and devotion. May Divine Grace light your path.', 105, footerY + 16, { align: 'center' });
  doc.text('Computer generated e-receipt. Valid without signature.', 105, footerY + 23, { align: 'center' });

  // Save PDF file
  doc.save(`${receiptNo}_${clientName.replace(/\s+/g, '_')}.pdf`);
}
