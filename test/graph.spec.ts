import { test, expect } from 'vitest';
import GraphByAdjacencyList from '../graph';

test('GraphByAdjacencyList', () => {
  const graph = new GraphByAdjacencyList();

  test('addNode', () => {
    expect(graph.addNode('A')).toBe(true)
    expect(graph.addNode('B')).toBe(true)
    expect(graph.addNode('A')).toBe(false) // Adding duplicate node should return false
  });

  test('addEdge', () => {
    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');

    expect(graph.addEdge('A', 'B')).toBe(true)
    expect(graph.addEdge('A', 'C')).toBe(true)
    expect(graph.addEdge('A', 'B')).toBe(false) // Adding duplicate edge should return false
    expect(graph.addEdge('B', 'C')).toBe(false) // Adding edge between non-existing nodes should return false
  });

  test('getNeighbors', () => {
    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');

    expect(graph.getNeighbors('A')).toBe(['B', 'C'])
    expect(graph.getNeighbors('B')).toBe([])
    expect(graph.getNeighbors('C')).toBe([])
    expect(graph.getNeighbors('D')).toBe(undefined) // Getting neighbors of non-existing node should return undefined
  });

  // Add more tests for other methods

});