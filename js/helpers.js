export class Manipulator {
   find(selector, container = document) {
      let collections = container.querySelectorAll(selector);

      return collections.length === 1 ? collections[0] : collections;
   }
}

export const DIRECTION = {
   LEFT: 'left',
   RIGHT: 'right',
   UP: 'up',
   DOWN: 'down',
};
