import { Pipe, PipeTransform } from '@angular/core';
import {ValantDemoApiClient} from "../../../api-client/api-client";
import MazeDefinition = ValantDemoApiClient.MazeDefinition;


@Pipe({
  name: 'mazeById'
})
export class MazeByIdPipe implements PipeTransform {
  transform(mazes: MazeDefinition[] | null, mazeId: string): MazeDefinition | null {
    if (!mazes || !mazeId) return null;
    return mazes.find(maze => maze.id === mazeId) ?? null;
  }
}
