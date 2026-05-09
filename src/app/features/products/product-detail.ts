import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../service/data.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss']
})
export class ProductDetail implements OnInit {
  product: any;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {}

 ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    // Buscamos el producto en el servicio usando el ID de la URL
    this.product = this.dataService.getProductById(+id);
    console.log('Producto cargado:', this.product); // Esto te dirá en la consola si funcionó
  }

  
  if (id) {
    // 2. Le pide al servicio el medicamento con ese número
    this.product = this.dataService.getProductById(+id);
  }
}

  volver() {
    this.router.navigate(['/productos']);
  }

}