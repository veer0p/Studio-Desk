import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { formatINR, formatIndianDate } from '@/lib/formatters';
import { BRAND_COLORS, PDF_TABLE_STYLES } from './helpers';
import React from 'react';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between' },
  logo: { width: 80, height: 40, objectFit: 'contain' },
  title: { fontSize: 24, fontWeight: 'bold', color: BRAND_COLORS.PRIMARY, marginBottom: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: BRAND_COLORS.PRIMARY, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 100, fontWeight: 'bold' },
  value: { flex: 1 },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 8, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 8 },
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },
  totals: { marginTop: 20, alignItems: 'flex-end' },
  totalRow: { flexDirection: 'row', paddingVertical: 4, width: 200 },
  grandTotal: { color: BRAND_COLORS.PRIMARY, fontSize: 16, fontWeight: 'bold', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  validUntil: { fontSize: 8, color: '#666', marginTop: 40, textAlign: 'center' }
});

export const ProposalDocument = ({ proposal }: { proposal: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cover Page */}
      <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        {proposal.studio.logo_url && <Image style={{ width: 150, marginBottom: 20 }} src={proposal.studio.logo_url} />}
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: BRAND_COLORS.PRIMARY }}>Proposal</Text>
        <Text style={{ fontSize: 18, marginTop: 10 }}>{proposal.booking.title}</Text>
        <Text style={{ fontSize: 12, marginTop: 40 }}>Prepared for:</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{proposal.client.full_name}</Text>
        <Text style={{ fontSize: 10, marginTop: 100 }}>{proposal.studio.name}</Text>
      </View>
    </Page>

      
      {/* Details Page */}
      <Page size="A4" style={styles.page}>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            <View style={styles.row}>
                <Text style={styles.label}>Event Date:</Text>
                <Text style={styles.value}>{formatIndianDate(proposal.booking.event_date)}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Venue:</Text>
                <Text style={styles.value}>{proposal.booking.venue_name}, {proposal.booking.venue_city}</Text>
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deliverables</Text>
            <Text>{proposal.notes || 'As per package details.'}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Breakdown</Text>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.colName}>Service/Item</Text>
                    <Text style={styles.colQty}>Qty</Text>
                    <Text style={styles.colPrice}>Unit Price</Text>
                    <Text style={styles.colTotal}>Total</Text>
                </View>
                {proposal.line_items.map((item: any, i: number) => (
                    <View key={i} style={styles.tableRow}>
                        <Text style={styles.colName}>{item.name}</Text>
                        <Text style={styles.colQty}>{item.quantity}</Text>
                        <Text style={styles.colPrice}>{formatINR(item.unit_price)}</Text>
                        <Text style={styles.colTotal}>{formatINR(item.total_price)}</Text>
                    </View>
                ))}
            </View>
        </View>

        <View style={styles.totals}>
            <View style={styles.totalRow}>
                <Text style={{ flex: 1 }}>Subtotal:</Text>
                <Text style={{ textAlign: 'right', width: 80 }}>{formatINR(proposal.subtotal)}</Text>
            </View>
            {proposal.cgst_amount > 0 && (
                <View style={styles.totalRow}>
                    <Text style={{ flex: 1 }}>CGST (9%):</Text>
                    <Text style={{ textAlign: 'right', width: 80 }}>{formatINR(proposal.cgst_amount)}</Text>
                </View>
            )}
            {proposal.sgst_amount > 0 && (
                <View style={styles.totalRow}>
                    <Text style={{ flex: 1 }}>SGST (9%):</Text>
                    <Text style={{ textAlign: 'right', width: 80 }}>{formatINR(proposal.sgst_amount)}</Text>
                </View>
            )}
            {proposal.igst_amount > 0 && (
                <View style={styles.totalRow}>
                    <Text style={{ flex: 1 }}>IGST (18%):</Text>
                    <Text style={{ textAlign: 'right', width: 80 }}>{formatINR(proposal.igst_amount)}</Text>
                </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={{ flex: 1, fontWeight: 'bold' }}>Grand Total:</Text>
                <Text style={{ textAlign: 'right', width: 80, fontWeight: 'bold' }}>{formatINR(proposal.total_amount)}</Text>
            </View>
        </View>

        <Text style={styles.validUntil}>This proposal is valid until {formatIndianDate(proposal.valid_until)}</Text>
      </Page>
  </Document>
);

