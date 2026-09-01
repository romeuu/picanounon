import { NgClass } from '@angular/common';
import { Component, Input, model } from '@angular/core';
import { TargetSpecies } from '../../../core/models/enums/species.enum';

@Component({
  selector: 'app-fish-selector',
  imports: [NgClass],
  standalone: true,
  templateUrl: './fish-selector.component.html',
  styleUrl: './fish-selector.component.css',
})
export class FishSelectorComponent {
  @Input() selectedSpecies: TargetSpecies | string = TargetSpecies.SARGOS;
  speciesSelected = model<TargetSpecies>(TargetSpecies.SARGOS);

  readonly speciesList = [
    { key: TargetSpecies.SARGOS, label: 'Sargos', icon: 'assets/sargos.svg' },
    {
      key: TargetSpecies.ROBALIZA,
      label: 'Robaliza',
      icon: 'assets/robalizas.svg',
    },
    { key: TargetSpecies.AGULLAS, label: 'Agulla', icon: 'assets/agullas.svg' },
  ];

  select(species: TargetSpecies): void {
    this.selectedSpecies = species;
    this.speciesSelected.set(species);
  }
}
