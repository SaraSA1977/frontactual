// src/app/features/dashboard/dashboard.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { ProductService } from '../../service/productService/productService';
import { FavoritosService } from '../../service/favoritosService/favoritosService';

type TabId = 'formas' | 'familias' | 'top10favoritos' | 'posologia' | 'concentracion';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private productService  = inject(ProductService);
  private favoritosService = inject(FavoritosService);

  // ── KPIs ─────────────────────────────────────────────────
  totalProductos    = 0;
  totalLaboratorios = 0;
  topCategoria      = '--';
  topForma          = '--';
  cargando          = true;

  // ── Pestañas ──────────────────────────────────────────────
  tabActiva = signal<TabId>('formas');

  tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'formas',          label: 'Formas farmacéuticas', icon: '💊' },
    { id: 'familias',        label: 'Familias',             icon: '🧬' },
    { id: 'top10favoritos',  label: 'Top 10 Favoritos',     icon: '⭐' },
    { id: 'posologia',       label: 'Posología',            icon: '📋' },
    { id: 'concentracion',   label: 'Concentraciones',      icon: '🔬' },
  ];

  setTab(id: TabId) { this.tabActiva.set(id); }

  // ── GRÁFICO BARRAS — Categorías ───────────────────────────
  readonly barChartType = 'bar' as const;

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Productos por categoría',
      backgroundColor: [
        'rgba(74,222,128,0.75)', 'rgba(248,113,113,0.75)',
        'rgba(45,212,191,0.75)', 'rgba(96,165,250,0.75)',
        'rgba(192,132,252,0.75)', 'rgba(251,191,36,0.75)',
        'rgba(148,163,184,0.75)',
      ],
      borderColor: ['#4ade80','#f87171','#2dd4bf','#60a5fa','#c084fc','#fbbf24','#94a3b8'],
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false, resizeDelay: 0,
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
        '#2dd4bf','#60a5fa','#4ade80','#c084fc','#f87171',
        '#fbbf24','#fb923c','#a78bfa','#38bdf8','#e879f9',
        '#86efac','#fde68a','#f9a8d4','#475569',
      ],
      borderColor: '#0f172a', borderWidth: 2, hoverOffset: 8,
    }]
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false, resizeDelay: 0,
    cutout: '65%',
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, padding: 10, boxWidth: 12 } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} productos` } }
    }
  };

  // ── GRÁFICAS DE PESTAÑAS ──────────────────────────────────

  // Formas — doughnut
  readonly formaChartType = 'doughnut' as const;
  formaChartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [], backgroundColor: ['#4ade80','#60a5fa','#f87171','#fbbf24','#c084fc','#2dd4bf','#fb923c','#a78bfa'], borderColor: '#0f172a', borderWidth: 2, hoverOffset: 6 }] };
  formaChartOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false, resizeDelay: 0, cutout: '60%',
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12 }, padding: 14, boxWidth: 14 } }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}` } } }
  };

  // Familias — barras horizontales
  readonly familiaChartType = 'bar' as const;
  familiaChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Productos', backgroundColor: 'rgba(96,165,250,0.7)', borderColor: '#60a5fa', borderWidth: 1, borderRadius: 4 }] };
  familiaChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false, resizeDelay: 0,
    indexAxis: 'y' as const,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} productos` } } },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true },
      y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.03)' } }
    }
  };

  // Top 10 Favoritos — barras horizontales
  readonly top10ChartType = 'bar' as const;
  top10ChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Veces añadido a favoritos',
      backgroundColor: 'rgba(251,191,36,0.7)',
      borderColor: '#fbbf24',
      borderWidth: 1,
      borderRadius: 4
    }]
  };
  top10ChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false, resizeDelay: 0,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x} favoritos` } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true },
      y: { ticks: { color: '#fbbf24', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.03)' } }
    }
  };

  // Posología — barras verticales
  readonly posologiaChartType = 'bar' as const;
  posologiaChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Productos', backgroundColor: 'rgba(45,212,191,0.7)', borderColor: '#2dd4bf', borderWidth: 1, borderRadius: 4 }] };
  posologiaChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false, resizeDelay: 0,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} productos` } } },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 30 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.07)' }, beginAtZero: true }
    }
  };

  // Concentración — barras verticales
  readonly concentracionChartType = 'bar' as const;
  concentracionChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Productos', backgroundColor: 'rgba(251,191,36,0.7)', borderColor: '#fbbf24', borderWidth: 1, borderRadius: 4 }] };
  concentracionChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false, resizeDelay: 0,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} productos` } } },
    scales: {
      x: { ticks: { color: '#94a3b8', font: { size: 10 }, maxRotation: 30 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.07)' }, beginAtZero: true }
    }
  };

  // ── Init ─────────────────────────────────────────────────
  ngOnInit(): void {
    // Cargar stats generales
    this.productService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalProductos    = stats.totalProductos;
        this.totalLaboratorios = stats.totalLaboratorios;
        this.topCategoria      = stats.topCategoria;
        this.topForma          = stats.topForma;

        // Gráfico categorías
        this.barChartData = {
          ...this.barChartData,
          labels: stats.productosPorCategoria.map((c: any) => c.label),
          datasets: [{ ...this.barChartData.datasets[0], data: stats.productosPorCategoria.map((c: any) => c.count) }]
        };

        // Doughnut laboratorios
        const topLabs  = stats.productosPorLab.slice(0, 13);
        const otrosLab = stats.productosPorLab.slice(13);
        const labLabels = topLabs.map((l: any) => l.label);
        const labData   = topLabs.map((l: any) => l.count);
        if (otrosLab.length > 0) {
          labLabels.push(`Otros (${otrosLab.length})`);
          labData.push(otrosLab.reduce((acc: number, l: any) => acc + l.count, 0));
        }
        this.doughnutChartData = {
          ...this.doughnutChartData,
          labels: labLabels,
          datasets: [{ ...this.doughnutChartData.datasets[0], data: labData }]
        };

        // Pestaña formas — doughnut
        this.formaChartData = {
          ...this.formaChartData,
          labels: stats.productosPorForma.map((f: any) => f.label),
          datasets: [{ ...this.formaChartData.datasets[0], data: stats.productosPorForma.map((f: any) => f.count) }]
        };

        // Pestaña familias — horizontal
        this.familiaChartData = {
          ...this.familiaChartData,
          labels: stats.productosPorFamilia.map((f: any) => f.label),
          datasets: [{ ...this.familiaChartData.datasets[0], data: stats.productosPorFamilia.map((f: any) => f.count) }]
        };

        // Pestaña posología — vertical
        this.posologiaChartData = {
          ...this.posologiaChartData,
          labels: stats.productosPorPosologia.slice(0, 10).map((p: any) => p.label),
          datasets: [{ ...this.posologiaChartData.datasets[0], data: stats.productosPorPosologia.slice(0, 10).map((p: any) => p.count) }]
        };

        // Pestaña concentración — vertical
        this.concentracionChartData = {
          ...this.concentracionChartData,
          labels: stats.productosPorConcentracion.slice(0, 12).map((c: any) => c.label),
          datasets: [{ ...this.concentracionChartData.datasets[0], data: stats.productosPorConcentracion.slice(0, 12).map((c: any) => c.count) }]
        };

        this.cargando = false;
      },
      error: (err) => {
        console.error('[DASHBOARD] Error stats:', err);
        this.cargando = false;
      }
    });

    // Cargar Top 10 Favoritos
    this.favoritosService.getTop10().subscribe({
      next: (res: any) => {
        const data: any[] = Array.isArray(res) ? res : (res?.data ?? []);
        this.top10ChartData = {
          ...this.top10ChartData,
          labels: data.map((item: any) => item.nombre ?? item.name ?? item.label ?? `Producto ${item.product_id}`),
          datasets: [{ ...this.top10ChartData.datasets[0], data: data.map((item: any) => item.total ?? item.count ?? 0) }]
        };
      },
      error: (err) => console.error('[DASHBOARD] Error top10:', err)
    });
  }
}