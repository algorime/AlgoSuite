import type { 
  HttpRequest, 
  PayloadSuggestion, 
  InjectionPoint, 
  PayloadApplicatorResult,
  PayloadApplication
} from '../types';

class PayloadApplicator {
  private generateApplicationId(): string {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async applyPayload(
    request: HttpRequest,
    payload: PayloadSuggestion,
    injectionPoint: InjectionPoint
  ): Promise<PayloadApplicatorResult> {
    try {
      const modifiedRequest = { ...request };
      let originalValue = '';
      let modifiedValue = '';
      let success = false;
      let preview = '';

      switch (injectionPoint.location) {
        case 'url_parameter': {
          const result = this.applyToUrlParameter(modifiedRequest, payload, injectionPoint);
          originalValue = result.originalValue;
          modifiedValue = result.modifiedValue;
          success = result.success;
          preview = result.preview;
          break;
        }

        case 'json_body': {
          const jsonResult = this.applyToJsonBody(modifiedRequest, payload, injectionPoint);
          originalValue = jsonResult.originalValue;
          modifiedValue = jsonResult.modifiedValue;
          success = jsonResult.success;
          preview = jsonResult.preview;
          break;
        }

        case 'form_data': {
          const formResult = this.applyToFormData(modifiedRequest, payload, injectionPoint);
          originalValue = formResult.originalValue;
          modifiedValue = formResult.modifiedValue;
          success = formResult.success;
          preview = formResult.preview;
          break;
        }

        case 'header': {
          const headerResult = this.applyToHeader(modifiedRequest, payload, injectionPoint);
          originalValue = headerResult.originalValue;
          modifiedValue = headerResult.modifiedValue;
          success = headerResult.success;
          preview = headerResult.preview;
          break;
        }

        default:
          throw new Error(`Unsupported injection point location: ${injectionPoint.location}`);
      }

      const appliedPayload: PayloadApplication = {
        id: this.generateApplicationId(),
        payload,
        injection_point: injectionPoint,
        applied_at: new Date(),
        original_value: originalValue,
        modified_value: modifiedValue,
        success
      };

      return {
        success,
        modified_request: modifiedRequest,
        applied_payload: appliedPayload,
        preview
      };

    } catch (error) {
      return {
        success: false,
        modified_request: request,
        applied_payload: {
          id: this.generateApplicationId(),
          payload,
          injection_point: injectionPoint,
          applied_at: new Date(),
          original_value: '',
          modified_value: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private applyToUrlParameter(
    request: HttpRequest,
    payload: PayloadSuggestion,
    injectionPoint: InjectionPoint
  ) {
    const url = new URL(request.url);
    const originalValue = url.searchParams.get(injectionPoint.parameter) || '';
    
    let modifiedValue = '';
    switch (payload.application_method) {
      case 'append':
        modifiedValue = originalValue + payload.payload;
        break;
      case 'prepend':
        modifiedValue = payload.payload + originalValue;
        break;
      case 'replace':
      default:
        modifiedValue = payload.payload;
        break;
    }

    url.searchParams.set(injectionPoint.parameter, modifiedValue);
    request.url = url.toString();

    return {
      originalValue,
      modifiedValue,
      success: true,
      preview: `URL parameter "${injectionPoint.parameter}" changed from "${originalValue}" to "${modifiedValue}"`
    };
  }

  private applyToJsonBody(
    request: HttpRequest,
    payload: PayloadSuggestion,
    injectionPoint: InjectionPoint
  ) {
    try {
      const jsonData = JSON.parse(request.body);
      const originalValue = this.getNestedValue(jsonData, injectionPoint.parameter);
      
      let modifiedValue = '';
      switch (payload.application_method) {
        case 'append':
          modifiedValue = originalValue + payload.payload;
          break;
        case 'prepend':
          modifiedValue = payload.payload + originalValue;
          break;
        case 'replace':
        default:
          modifiedValue = payload.payload;
          break;
      }

      this.setNestedValue(jsonData, injectionPoint.parameter, modifiedValue);
      request.body = JSON.stringify(jsonData, null, 2);

      return {
        originalValue,
        modifiedValue,
        success: true,
        preview: `JSON parameter "${injectionPoint.parameter}" changed from "${originalValue}" to "${modifiedValue}"`
      };
    } catch (error) {
      throw new Error(`Failed to parse JSON body: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private applyToFormData(
    request: HttpRequest,
    payload: PayloadSuggestion,
    injectionPoint: InjectionPoint
  ) {
    const formData = new URLSearchParams(request.body);
    const originalValue = formData.get(injectionPoint.parameter) || '';
    
    let modifiedValue = '';
    switch (payload.application_method) {
      case 'append':
        modifiedValue = originalValue + payload.payload;
        break;
      case 'prepend':
        modifiedValue = payload.payload + originalValue;
        break;
      case 'replace':
      default:
        modifiedValue = payload.payload;
        break;
    }

    formData.set(injectionPoint.parameter, modifiedValue);
    request.body = formData.toString();

    return {
      originalValue,
      modifiedValue,
      success: true,
      preview: `Form parameter "${injectionPoint.parameter}" changed from "${originalValue}" to "${modifiedValue}"`
    };
  }

  private applyToHeader(
    request: HttpRequest,
    payload: PayloadSuggestion,
    injectionPoint: InjectionPoint
  ) {
    const originalValue = request.headers[injectionPoint.parameter] || '';
    
    let modifiedValue = '';
    switch (payload.application_method) {
      case 'append':
        modifiedValue = originalValue + payload.payload;
        break;
      case 'prepend':
        modifiedValue = payload.payload + originalValue;
        break;
      case 'replace':
      default:
        modifiedValue = payload.payload;
        break;
    }

    request.headers[injectionPoint.parameter] = modifiedValue;

    return {
      originalValue,
      modifiedValue,
      success: true,
      preview: `Header "${injectionPoint.parameter}" changed from "${originalValue}" to "${modifiedValue}"`
    };
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): string {
    let current: unknown = obj;
    for (const key of path.split('.')) {
      if (current && typeof current === 'object' && current !== null && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return '';
      }
    }
    return String(current || '');
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: string): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    if (!lastKey) return;
    
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key] as Record<string, unknown>;
    }, obj);
    
    target[lastKey] = value;
  }

  generatePreview(
    payload: PayloadSuggestion,
    injectionPoint: InjectionPoint,
    originalValue: string
  ): string {
    let modifiedValue = '';
    switch (payload.application_method) {
      case 'append':
        modifiedValue = originalValue + payload.payload;
        break;
      case 'prepend':
        modifiedValue = payload.payload + originalValue;
        break;
      case 'replace':
      default:
        modifiedValue = payload.payload;
        break;
    }

    return `${injectionPoint.location} "${injectionPoint.parameter}": "${originalValue}" → "${modifiedValue}"`;
  }
}

export default new PayloadApplicator();