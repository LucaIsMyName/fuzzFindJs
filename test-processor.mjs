import { EnglishProcessor } from './dist/esm/index.js';

const processor = new EnglishProcessor();
console.log('normalize("cafe"):', processor.normalize('cafe'));
console.log('normalize("café"):', processor.normalize('café'));
console.log('normalize("CAFE"):', processor.normalize('CAFE'));
