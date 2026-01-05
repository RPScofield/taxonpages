import axios from 'axios'

/**
 * Service for interacting with the Paleobiology Database API
 * @see https://paleobiodb.org/data1.2/
 */
class PaleobioDB {
  constructor() {
    this.baseURL = 'https://paleobiodb.org/data1.2'
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000
    })
  }

  /**
   * Get timescale diagram data
   * @param {number} id - Timescale ID (default: 1 for the standard international timescale)
   * @returns {Promise} Timescale diagram data
   * @see https://paleobiodb.org/data1.2/intervals_doc.html
   */
  async getTimescaleDiagram(id = 1) {
    try {
      // The PaleobioDB API doesn't have a dedicated timescales/diagram endpoint
      // Instead, we use the intervals/list endpoint to get all intervals for a timescale
      const response = await this.client.get('/intervals/list.json', {
        params: {
          scale_id: id,
          // Request all interval levels to build the full timescale hierarchy
          // This includes periods, series/epochs, and stages/ages
          all_records: true
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching timescale diagram from PaleobioDB:', error)
      throw error
    }
  }

  /**
   * Get list of geological intervals
   * @param {Object} params - Query parameters
   * @param {string} params.scale_id - ID of the timescale to use (default: 1)
   * @param {string} params.min_ma - Minimum age in Ma
   * @param {string} params.max_ma - Maximum age in Ma
   * @returns {Promise} List of intervals
   * @see https://paleobiodb.org/data1.2/intervals_doc.html
   */
  async getIntervals(params = {}) {
    try {
      const response = await this.client.get('/intervals/list.json', {
        params: {
          scale_id: 1,
          ...params
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching intervals from PaleobioDB:', error)
      throw error
    }
  }

  /**
   * Get a single interval by name or ID
   * @param {string|number} identifier - Interval name or ID
   * @returns {Promise} Interval data
   */
  async getInterval(identifier) {
    try {
      const response = await this.client.get('/intervals/single.json', {
        params: {
          id: identifier
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching interval from PaleobioDB:', error)
      throw error
    }
  }

  /**
   * Get occurrences for a taxon by scientific name
   * @param {string} scientificName - Scientific name of the taxon
   * @param {Object} params - Additional query parameters
   * @returns {Promise} List of occurrences with stratigraphic data
   * @see https://paleobiodb.org/data1.2/occs_doc.html
   */
  async getOccurrences(scientificName, params = {}) {
    try {
      const response = await this.client.get('/occs/list.json', {
        params: {
          base_name: scientificName,
          show: 'time,loc',
          ...params
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching occurrences from PaleobioDB:', error)
      throw error
    }
  }
}

// Export a singleton instance
export default new PaleobioDB()
