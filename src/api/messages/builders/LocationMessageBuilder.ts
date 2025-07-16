import type { LocationObject } from '../types/location';

/**
 * Builder class for creating location messages with a fluent API
 */
export class LocationMessageBuilder {
    private location: Partial<LocationObject> = {};

    /**
     * Set the latitude coordinate
     */
    setLatitude(latitude: number): this {
        if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
            throw new Error('Latitude must be a number between -90 and 90');
        }
        this.location.latitude = latitude;
        return this;
    }

    /**
     * Set the longitude coordinate
     */
    setLongitude(longitude: number): this {
        if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
            throw new Error('Longitude must be a number between -180 and 180');
        }
        this.location.longitude = longitude;
        return this;
    }

    /**
     * Set coordinates using latitude and longitude
     */
    setCoordinates(latitude: number, longitude: number): this {
        return this.setLatitude(latitude).setLongitude(longitude);
    }

    /**
     * Set the location name
     */
    setName(name: string): this {
        if (name && typeof name !== 'string') {
            throw new Error('Location name must be a string');
        }
        this.location.name = name;
        return this;
    }

    /**
     * Set the location address
     */
    setAddress(address: string): this {
        if (address && typeof address !== 'string') {
            throw new Error('Location address must be a string');
        }
        this.location.address = address;
        return this;
    }

    /**
     * Build the final location object
     */
    build(): LocationObject {
        if (this.location.latitude === undefined) {
            throw new Error('Latitude is required');
        }
        if (this.location.longitude === undefined) {
            throw new Error('Longitude is required');
        }

        return this.location as LocationObject;
    }

    /**
     * Reset the builder for reuse
     */
    reset(): this {
        this.location = {};
        return this;
    }
}

/**
 * Factory class for common location patterns
 */
export class LocationMessageFactory {
    /**
     * Create a simple location with just coordinates
     */
    static createSimpleLocation(latitude: number, longitude: number): LocationObject {
        return new LocationMessageBuilder().setCoordinates(latitude, longitude).build();
    }

    /**
     * Create a location with name and address
     */
    static createNamedLocation(latitude: number, longitude: number, name: string, address: string): LocationObject {
        return new LocationMessageBuilder()
            .setCoordinates(latitude, longitude)
            .setName(name)
            .setAddress(address)
            .build();
    }

    /**
     * Create a business location
     */
    static createBusinessLocation(
        latitude: number,
        longitude: number,
        businessName: string,
        fullAddress: string,
    ): LocationObject {
        return new LocationMessageBuilder()
            .setCoordinates(latitude, longitude)
            .setName(businessName)
            .setAddress(fullAddress)
            .build();
    }
}
