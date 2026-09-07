class ApiResponse {
  constructor(success, message, data = null, errors = null, pagination = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.pagination = pagination;
  }

  static success(message, data = null, pagination = null) {
    return new ApiResponse(true, message, data, null, pagination);
  }

  static error(message, errors = null, data = null) {
    return new ApiResponse(false, message, data, errors, null);
  }

  static paginated(message, data, pagination) {
    return new ApiResponse(true, message, data, null, pagination);
  }
}

module.exports = ApiResponse;
