import { Policy, PolicyApiResponse } from '../types/Policy';

const BASE_URL = 'https://api.policyvoter.com/v1/policy/top/list';
const CONSTITUENT_ID = 'UNE079UK';

export class PolicyApiService {
  private async fetchPage(page: number): Promise<Policy[]> {
    const url = `${BASE_URL}?constituentId=${CONSTITUENT_ID}&page=${page}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const response_data = await response.json();
      
      // Handle the PolicyVoter API response format
      if (response_data && response_data.success && response_data.data) {
        const data = response_data.data;
        
        if (data.policies && Array.isArray(data.policies)) {
          return data.policies;
        }
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch page ${page}:`, error);
      throw error;
    }
  }

  async fetchAllPolicies(): Promise<Policy[]> {
    const allPolicies: Policy[] = [];
    let currentPage = 1;
    const maxConcurrentRequests = 5;
    
    try {
      const firstPage = await this.fetchPage(1);
      if (!Array.isArray(firstPage) || firstPage.length === 0) {
        return [];
      }
      
      allPolicies.push(...firstPage);
      currentPage = 2;
      
      const promises: Promise<Policy[]>[] = [];
      
      while (true) {
        for (let i = 0; i < maxConcurrentRequests; i++) {
          promises.push(this.fetchPage(currentPage + i));
        }
        
        const results = await Promise.allSettled(promises);
        const validResults = results
          .filter((result): result is PromiseFulfilledResult<Policy[]> => 
            result.status === 'fulfilled' && 
            Array.isArray(result.value) && 
            result.value.length > 0
          )
          .map(result => result.value);
        
        if (validResults.length === 0) {
          break;
        }
        
        validResults.forEach(policies => {
          if (Array.isArray(policies)) {
            allPolicies.push(...policies);
          }
        });
        
        if (validResults.length < maxConcurrentRequests) {
          break;
        }
        
        currentPage += maxConcurrentRequests;
        promises.length = 0;
      }
      
      return allPolicies.map((policy, index) => ({
        ...policy,
        rank: index + 1
      }));
      
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw new Error('Failed to fetch policies. Please try again later.');
    }
  }
}

export const policyApiService = new PolicyApiService();