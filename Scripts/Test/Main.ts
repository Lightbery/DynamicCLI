import { DynamicCLI } from '../../DynamicCLI'

new DynamicCLI()
  .createPage('page1', 'Page 1', () => ['This is page 1'])
  .createPage('page2', 'Page 2', () => ['This is page 2'])
