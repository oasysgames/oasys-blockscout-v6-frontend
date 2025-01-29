import React, { useCallback, useMemo, useState } from 'react';

import type { LineChartInfo, LineChartSection } from '@blockscout/stats-types';
import type { StatsIntervalIds } from 'types/client/stats';

import { getChartsInfo } from './api/getChartsInfo';
import { useApiData } from './useApiData';

function isSectionMatches(section: LineChartSection, currentSection: string): boolean {
  return currentSection === 'all' || section.id === currentSection;
}

function isChartNameMatches(q: string, chart: LineChartInfo) {
  return chart.title.toLowerCase().includes(q.toLowerCase());
}

export default function useExperiment() {
  // get charts info
  const { data, isPlaceholderData, isError } = useApiData(getChartsInfo, [], { sections: [] });

  const [ currentSection, setCurrentSection ] = useState('all');
  const [ filterQuery, setFilterQuery ] = useState('');
  const [ interval, setInterval ] = useState<StatsIntervalIds>('oneMonth');
  const sectionIds = useMemo(() => data?.sections?.map(({ id }) => id), [ data ]);

  // filtered sections
  const filteredSections: Array<LineChartSection> = React.useMemo(() => {
    return data?.sections
      ?.map((section) => {
        const charts = section.charts.filter((chart) => isSectionMatches(section, currentSection) && isChartNameMatches(filterQuery, chart));

        return {
          ...section,
          charts,
        };
      }).filter((section) => section.charts.length > 0) || [];
  }, [ currentSection, data?.sections, filterQuery ]);

  const handleSectionChange = useCallback((newSection: string) => {
    setCurrentSection(newSection);
  }, []);

  const handleIntervalChange = useCallback((newInterval: StatsIntervalIds) => {
    setInterval(newInterval);
  }, []);

  const handleFilterChange = useCallback((q: string) => {
    setFilterQuery(q);
  }, []);

  return React.useMemo(() => ({
    sections: data?.sections,
    sectionIds,
    isPlaceholderData,
    isError,
    filterQuery,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    filteredSections,
  }), [
    data,
    sectionIds,
    isPlaceholderData,
    isError,
    filterQuery,
    currentSection,
    handleSectionChange,
    interval,
    handleIntervalChange,
    handleFilterChange,
    filteredSections,
  ]);
}
