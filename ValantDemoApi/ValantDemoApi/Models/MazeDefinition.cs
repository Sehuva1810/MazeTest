using System;

namespace ValantDemoApi.Models
{
  public class MazeDefinition
  {
    public string Id { get; set; }
    public string Name { get; set; }
    public string Grid { get; set; }
    public Position Start { get; set; }
    public Position Exit { get; set; }

    public char[,] GetGridArray()
    {
      var lines = Grid.Split('\n');
      var rows = lines.Length;
      var cols = lines[0].Length;
      var grid = new char[rows, cols];

      for (int i = 0; i < rows; i++)
      {
        for (int j = 0; j < cols; j++)
        {
          grid[i, j] = lines[i][j];
        }
      }

      return grid;
    }
  }

}
