import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emptyValue'
})
export class EmptyValuePipe implements PipeTransform {
  transform(value: any): any {
    if (value == 0 || value === null || value === undefined || value === '') {
      return '-';
    }
    return value;
  }
}