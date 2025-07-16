import type {
    AddressesObject,
    ContactObject,
    EmailObject,
    NameObject,
    OrgObject,
    PhoneObject,
    URLObject,
} from '../types/contact';

/**
 * Builder class for creating contact messages with a fluent API
 */
export class ContactMessageBuilder {
    private contact: Partial<ContactObject> = {};

    /**
     * Set the contact name (required)
     */
    setName(name: NameObject): this {
        if (!name || typeof name !== 'object') {
            throw new Error('Name must be an object');
        }
        this.contact.name = name;
        return this;
    }

    /**
     * Set simple name with first name only
     */
    setSimpleName(firstName: string, lastName?: string): this {
        if (!firstName || typeof firstName !== 'string') {
            throw new Error('First name must be a non-empty string');
        }
        const name: NameObject = {
            formatted_name: lastName ? `${firstName} ${lastName}` : firstName,
            first_name: firstName,
        };
        if (lastName) {
            name.last_name = lastName;
        }
        return this.setName(name);
    }

    /**
     * Set full name details
     */
    setFullName(firstName: string, lastName?: string, middleName?: string, suffix?: string, prefix?: string): this {
        if (!firstName || typeof firstName !== 'string') {
            throw new Error('First name must be a non-empty string');
        }

        const nameParts = [prefix, firstName, middleName, lastName, suffix].filter(Boolean);
        const name: NameObject = {
            formatted_name: nameParts.join(' '),
            first_name: firstName,
        };

        if (lastName) name.last_name = lastName;
        if (middleName) name.middle_name = middleName;
        if (suffix) name.suffix = suffix;
        if (prefix) name.prefix = prefix;

        return this.setName(name);
    }

    /**
     * Add phone numbers
     */
    addPhone(phone: string, type?: string, waId?: string): this {
        if (!phone || typeof phone !== 'string') {
            throw new Error('Phone number must be a non-empty string');
        }

        const phoneObj: PhoneObject = { phone: 'PHONE_NUMBER' };
        if (type) phoneObj.type = type;
        if (waId) phoneObj.wa_id = waId;

        if (!this.contact.phones) {
            this.contact.phones = [];
        }
        this.contact.phones.push(phoneObj);
        return this;
    }

    /**
     * Add email addresses
     */
    addEmail(email: string, type?: string): this {
        if (!email || typeof email !== 'string') {
            throw new Error('Email must be a non-empty string');
        }
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            throw new Error('Invalid email format');
        }

        const emailObj: EmailObject = { email };
        if (type) emailObj.type = type;

        if (!this.contact.emails) {
            this.contact.emails = [];
        }
        this.contact.emails.push(emailObj);
        return this;
    }

    /**
     * Add address
     */
    addAddress(address: AddressesObject): this {
        if (!address || typeof address !== 'object') {
            throw new Error('Address must be an object');
        }

        if (!this.contact.addresses) {
            this.contact.addresses = [];
        }
        this.contact.addresses.push(address);
        return this;
    }

    /**
     * Add simple address
     */
    addSimpleAddress(street: string, city: string, country: string, type?: string): this {
        const address: AddressesObject = {
            street,
            city,
            country,
        };
        if (type) address.type = type;
        return this.addAddress(address);
    }

    /**
     * Set organization details
     */
    setOrganization(company: string, department?: string, title?: string): this {
        const org: OrgObject = {};
        if (company) org.company = company;
        if (department) org.department = department;
        if (title) org.title = title;

        this.contact.org = org;
        return this;
    }

    /**
     * Add URL
     */
    addUrl(url: string, type?: string): this {
        if (!url || typeof url !== 'string') {
            throw new Error('URL must be a non-empty string');
        }

        const urlObj: URLObject = { url };
        if (type) urlObj.type = type;

        if (!this.contact.urls) {
            this.contact.urls = [];
        }
        this.contact.urls.push(urlObj);
        return this;
    }

    /**
     * Set birthday (format: YYYY-MM-DD)
     */
    setBirthday(year: number, month: number, day: number): this {
        const monthStr = month.toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        this.contact.birthday = `${year}-${monthStr}-${dayStr}` as ContactObject['birthday'];
        return this;
    }

    /**
     * Build the final contact object
     */
    build(): ContactObject {
        if (!this.contact.name) {
            throw new Error('Contact name is required');
        }

        return this.contact as ContactObject;
    }

    /**
     * Reset the builder for reuse
     */
    reset(): this {
        this.contact = {};
        return this;
    }
}

/**
 * Factory class for common contact patterns
 */
export class ContactMessageFactory {
    /**
     * Create a simple contact with name and phone
     */
    static createSimpleContact(firstName: string, phone: string): ContactObject {
        return new ContactMessageBuilder().setSimpleName(firstName).addPhone(phone).build();
    }

    /**
     * Create a business contact
     */
    static createBusinessContact(
        firstName: string,
        lastName: string,
        company: string,
        title: string,
        phone: string,
        email: string,
    ): ContactObject {
        return new ContactMessageBuilder()
            .setSimpleName(firstName, lastName)
            .setOrganization(company, undefined, title)
            .addPhone(phone, 'WORK')
            .addEmail(email, 'WORK')
            .build();
    }

    /**
     * Create a personal contact with full details
     */
    static createPersonalContact(
        firstName: string,
        lastName: string,
        mobilePhone: string,
        email?: string,
        birthday?: { year: number; month: number; day: number },
    ): ContactObject {
        const builder = new ContactMessageBuilder().setSimpleName(firstName, lastName).addPhone(mobilePhone, 'MOBILE');

        if (email) {
            builder.addEmail(email, 'HOME');
        }

        if (birthday) {
            builder.setBirthday(birthday.year, birthday.month, birthday.day);
        }

        return builder.build();
    }
}
