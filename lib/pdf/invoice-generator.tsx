import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { formatINR, formatIndianDate } from '@/lib/formatters';
import { amountInWords, getPDFStyles } from './helpers';
import React from 'react';

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 20,
  },
  studioInfo: {
    flexDirection: 'column',
  },
  studioName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'right',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailsColumn: {
    flexDirection: 'column',
    width: '45%',
  },
  label: {
    color: '#64748B',
    marginBottom: 2,
    fontSize: 8,
    textTransform: 'uppercase',
  },
  value: {
    marginBottom: 8,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottom: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#F1F5F9',
    padding: 8,
  },
  colDescription: { width: '40%' },
  colHSN: { width: '15%', textAlign: 'center' },
  colQty: { width: '10%', textAlign: 'center' },
  colRate: { width: '15%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },
  
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalsTable: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
    borderTop: 1,
    borderTopColor: '#3B82F6',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  amountInWords: {
    marginTop: 20,
    fontStyle: 'italic',
    fontSize: 9,
  },
  footer: {
    marginTop: 50,
    borderTop: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 8,
  },
  stamp: {
    position: 'absolute',
    top: 60,
    right: 40,
    borderWidth: 2,
    padding: 10,
    borderRadius: 4,
    transform: 'rotate(-15deg)',
    opacity: 0.5,
    fontSize: 20,
    fontWeight: 'bold',
  }
});

interface InvoicePDFProps {
  invoice: any;
  studio: any;
  client: any;
  lineItems: any[];
}

export const InvoiceDocument = ({ invoice, studio, client, lineItems }: InvoicePDFProps) => {
  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue' && new Date(invoice.due_date) < new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.studioInfo}>
            <Text style={styles.studioName}>{studio.name}</Text>
            <Text>{studio.address}</Text>
            <Text>GSTIN: {studio.gstin || 'N/A'}</Text>
            <Text>PAN: {studio.pan || 'N/A'}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={{ textAlign: 'right' }}>#{invoice.invoice_number}</Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailsColumn}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={[styles.value, { fontWeight: 'bold' }]}>{client.name}</Text>
            <Text style={styles.value}>{client.address || 'N/A'}</Text>
            {client.gstin && <Text>GSTIN: {client.gstin}</Text>}
          </View>
          <View style={[styles.detailsColumn, { textAlign: 'right' }]}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatIndianDate(invoice.created_at)}</Text>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{formatIndianDate(invoice.due_date)}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colHSN}>HSN/SAC</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>

          {lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.name}</Text>
              <Text style={styles.colHSN}>{item.hsn_sac_code}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colRate}>{formatINR(item.unit_price)}</Text>
              <Text style={styles.colAmount}>{formatINR(item.quantity * item.unit_price)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>{formatINR(invoice.subtotal)}</Text>
            </View>
            {invoice.gst_type === 'cgst_sgst' ? (
              <>
                <View style={styles.totalRow}>
                  <Text>CGST (9%)</Text>
                  <Text>{formatINR(invoice.cgst_amount)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text>SGST (9%)</Text>
                  <Text>{formatINR(invoice.sgst_amount)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.totalRow}>
                <Text>IGST (18%)</Text>
                <Text>{formatINR(invoice.igst_amount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text>Total</Text>
              <Text>{formatINR(invoice.total_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Amount in words */}
        <View style={styles.amountInWords}>
          <Text>{amountInWords(invoice.total_amount)}</Text>
        </View>

        {/* Status Stamp */}
        {isPaid && (
          <View style={[styles.stamp, { borderColor: '#10B981', color: '#10B981' }]}>
            <Text>PAID</Text>
          </View>
        )}
        {isOverdue && !isPaid && (
          <View style={[styles.stamp, { borderColor: '#EF4444', color: '#EF4444' }]}>
            <Text>OVERDUE</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          {studio.bank_details && (
            <Text style={{ marginTop: 4 }}>
              Bank: {studio.bank_details.bank_name} | A/c: {studio.bank_details.account_number} | IFSC: {studio.bank_details.ifsc}
            </Text>
          )}
          <Text style={{ marginTop: 4 }}>Generated via StudioDesk.in</Text>
        </View>
      </Page>
    </Document>
  );
};
