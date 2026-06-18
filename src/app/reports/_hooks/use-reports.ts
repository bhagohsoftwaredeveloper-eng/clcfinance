'use client';

import { useEffect, useState } from 'react';
import type { Member } from '@/lib/types';
import { memberNetworks, membershipData, getDynamicChartConfig } from '../_lib/report-helpers';
import type { PrintSelection } from '../_lib/report-export';

const DEFAULT_PRINT_SELECTION: PrintSelection = {
  network: true,
  service: true,
  incomeVsExpenses: false,
  membershipGrowth: false,
  givingByNetworkPie: true,
  donationCategoriesPie: false,
  givingByServicePie: true,
};

/**
 * Owns the reports filters, fetches the aggregated report data, and exposes the
 * derived series + chart configs the page renders, plus the print-selection.
 */
export function useReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [reportsData, setReportsData] = useState<any>(null);
  const [networks, setNetworks] = useState<Member['network'][]>(memberNetworks);
  const [loading, setLoading] = useState(false);
  const [printSelection, setPrintSelection] = useState<PrintSelection>(DEFAULT_PRINT_SELECTION);

  // Defaults: year-to-date range + the networks list.
  useEffect(() => {
    const now = new Date();
    setStartDate(`${now.getFullYear()}-01-01`);
    setEndDate(now.toISOString().split('T')[0]);

    fetch('/api/networks')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNetworks(data.map((n: { name: string }) => n.name)))
      .catch((error) => console.error('Failed to fetch networks:', error));
  }, []);

  // Refetch whenever the filters change.
  useEffect(() => {
    if (!startDate || !endDate) return;
    setLoading(true);
    const params = new URLSearchParams({ startDate, endDate, service: selectedService, network: selectedNetwork });
    fetch(`/api/reports?${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setReportsData(data))
      .catch((error) => console.error('Failed to fetch reports:', error))
      .finally(() => setLoading(false));
  }, [startDate, endDate, selectedService, selectedNetwork]);

  const setPrintFlag = (key: keyof PrintSelection, checked: boolean) =>
    setPrintSelection((prev) => ({ ...prev, [key]: checked }));

  const setAllPrintFlags = (checked: boolean) =>
    setPrintSelection({
      network: checked, service: checked, incomeVsExpenses: checked, membershipGrowth: checked,
      givingByNetworkPie: checked, donationCategoriesPie: checked, givingByServicePie: checked,
    });

  // Derived data straight from the API response.
  const totalMembers = reportsData?.summary?.totalMembers || 0;
  const totalDonations = reportsData?.summary?.totalDonations || 0;
  const totalExpenses = reportsData?.summary?.totalExpenses || 0;
  const donationsByCategory = reportsData?.data?.donationsByCategory || [];
  const donationsByNetwork = reportsData?.data?.donationsByNetwork || [];
  const donationsByServiceTime = reportsData?.data?.donationsByServiceTime || [];
  const incomeVsExpensesData = reportsData?.data?.incomeVsExpensesData || [];
  const serviceTimes = reportsData?.data?.serviceTimes || [];
  const membershipGrowthData = reportsData?.data?.membershipGrowthData || membershipData;

  return {
    // filters
    startDate, setStartDate, endDate, setEndDate,
    selectedService, setSelectedService, selectedNetwork, setSelectedNetwork,
    networks, loading,
    // print selection
    printSelection, setPrintFlag, setAllPrintFlags,
    isPrintAllChecked: Object.values(printSelection).every(Boolean),
    // derived data
    totalMembers, totalDonations, totalExpenses,
    donationsByCategory, donationsByNetwork, donationsByServiceTime,
    incomeVsExpensesData, serviceTimes, membershipGrowthData,
    // chart configs
    categoryChartConfig: getDynamicChartConfig(donationsByCategory, 'category'),
    networkChartConfig: getDynamicChartConfig(donationsByNetwork),
  };
}
