// src/app/features/dashboard/dashboard.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';

import { ProductService } from '../../service/productService/productService';

type TabId = 'formas' | 'familias' | 'mecanismo' | 'posologia' | 'concentracion';

interface TabRow {
  nombre: string;
  cantidad: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private productService = inject(ProductService);

  // ── KPIs ─────────────────────────────────────────────────
  totalProductos    = 0;
  totalLaboratorios = 0;
  topCategoria      = '--';
  topForma          = '--';
  cargando          = true;

  // ── Pestañas ──────────────────────────────────────────────
  tabActiva = signal<TabId>('formas');

  tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'formas',        label: 'Formas farmacéuticas', icon: '💊' },
    { id: 'familias',      label: 'Familias',             icon: '🧬' },
    { id: 'mecanismo',     label: 'Mecanismo de acción',  icon: '⚙️' },
    { id: 'posologia',     label: 'Posología',            icon: '📋' },
    { id: 'concentracion', label: 'Concentraciones',      icon: '🔬' },
  ];

  tabData: Record<TabId, TabRow[]> = {
    formas:        [],
    familias:      [],
    mecanismo:     [],
    posologia:     [],
    concentracion: [],
  };

  get tabHeaders(): Record<TabId, string> {
    return {
      formas:        'Forma farmacéutica',
      familias:      'Familia',
      mecanismo:     'Mecanismo de acción',
      posologia:     'Posología',
      concentracion: 'Concentración',
    };
  }

  setTab(id: TabId) {
    this.tabActiva.set(id);
  }

  // ── GRÁFICO DE BARRAS — Productos por categoría ──────────
  readonly barChartType = 'bar' as const;

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Productos por categoría',
      backgroundColor: [
        'rgba(74,  222, 128, 0.75)',
        'rgba(248, 113, 113, 0.75)',
        'rgba(45,  212, 191, 0.75)',
        'rgba(96,  165, 250, 0.75)',
        'rgba(192, 132, 252, 0.75)',
        'rgba(251, 191,  36, 0.75)',
        'rgba(148, 163, 184, 0.75)',
      ],
      borderColor: [
        '#4ade80', '#f87171', '#2dd4bf',
        '#60a5fa', '#c084fc', '#fbbf24', '#94a3b8',
      ],
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} productos` } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.07)' }, beginAtZero: true }
    }
  };

  // ── GRÁFICO DOUGHNUT — Laboratorios ──────────────────────
  readonly doughnutChartType = 'doughnut' as const;

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#2dd4bf', '#60a5fa', '#4ade80', '#c084fc',
        '#f87171', '#fbbf24', '#fb923c', '#a78bfa',
        '#38bdf8', '#e879f9', '#86efac', '#fde68a',
        '#f9a8d4', '#475569',
      ],
      borderColor: '#0f172a',
      borderWidth: 2,
      hoverOffset: 8,
    }]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 0,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', font: { size: 11 }, padding: 10, boxWidth: 12 }
      },
      tooltip: {
        callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} productos` }
      }
    }
  };

  // ── Init ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.productService.getDashboardStats().subscribe({
      next: (stats) => {

        // KPIs
        this.totalProductos    = stats.totalProductos;
        this.totalLaboratorios = stats.totalLaboratorios;
        this.topCategoria      = stats.topCategoria;
        this.topForma          = stats.topForma;

        // Gráfico barras — categorías
        this.barChartData = {
          ...this.barChartData,
          labels: stats.productosPorCategoria.map(c => c.label),
          datasets: [{ ...this.barChartData.datasets[0], data: stats.productosPorCategoria.map(c => c.count) }]
        };

        // Doughnut — laboratorios
        const topLabs  = stats.productosPorLab.slice(0, 13);
        const otrosLab = stats.productosPorLab.slice(13);
        const labLabels = topLabs.map(l => l.label);
        const labData   = topLabs.map(l => l.count);
        if (otrosLab.length > 0) {
          labLabels.push(`Otros (${otrosLab.length} labs)`);
          labData.push(otrosLab.reduce((acc, l) => acc + l.count, 0));
        }
        this.doughnutChartData = {
          ...this.doughnutChartData,
          labels: labLabels,
          datasets: [{ ...this.doughnutChartData.datasets[0], data: labData }]
        };

        // Datos de pestañas
        this.tabData = {
          formas:        stats.productosPorForma.map(f => ({ nombre: f.label, cantidad: f.count })),
          familias:      stats.productosPorFamilia.map(f => ({ nombre: f.label, cantidad: f.count })),
          mecanismo:     stats.productosPorMecanismo.map(m => ({ nombre: m.label, cantidad: m.count })),
          posologia:     stats.productosPorPosologia.map(p => ({ nombre: p.label, cantidad: p.count })),
          concentracion: stats.productosPorConcentracion.map(c => ({ nombre: c.label, cantidad: c.count })),
        };

        this.cargando = false;
      },
      error: (err) => {
        console.error('[DASHBOARD] Error cargando stats:', err);
        this.cargando = false;
      }
    });
  }
}