import type {
    AudioMediaObject,
    DocumentMediaObject,
    ImageMediaObject,
    StickerMediaObject,
    VideoMediaObject,
} from '../types/media';

/**
 * Base builder for media messages
 */
abstract class BaseMediaBuilder<T> {
    protected media: Partial<T> = {};

    /**
     * Set media ID (for uploaded media)
     */
    setId(id: string): this {
        if (!id || typeof id !== 'string') {
            throw new Error('Media ID must be a non-empty string');
        }
        (this.media as any).id = id;
        return this;
    }

    /**
     * Set media URL
     */
    setLink(url: string): this {
        if (!url || typeof url !== 'string') {
            throw new Error('Media URL must be a non-empty string');
        }
        if (!url.match(/^https?:\/\//)) {
            throw new Error('Media URL must be a valid HTTP/HTTPS URL');
        }
        (this.media as any).link = url;
        return this;
    }

    /**
     * Set media caption
     */
    setCaption(caption: string): this {
        if (caption && typeof caption !== 'string') {
            throw new Error('Caption must be a string');
        }
        (this.media as any).caption = caption;
        return this;
    }

    /**
     * Build the media object
     */
    build(): T {
        if (!(this.media as any).id && !(this.media as any).link) {
            throw new Error('Either media ID or link is required');
        }
        return this.media as T;
    }

    /**
     * Reset the builder
     */
    reset(): this {
        this.media = {};
        return this;
    }
}

/**
 * Builder for image messages
 */
export class ImageMessageBuilder extends BaseMediaBuilder<ImageMediaObject> {
    // Image inherits all methods from BaseMediaBuilder
}

/**
 * Builder for video messages
 */
export class VideoMessageBuilder extends BaseMediaBuilder<VideoMediaObject> {
    // Video inherits all methods from BaseMediaBuilder
}

/**
 * Builder for audio messages
 */
export class AudioMessageBuilder extends BaseMediaBuilder<AudioMediaObject> {
    // Audio doesn't support caption
    setCaption(caption: string): this {
        throw new Error('Audio messages do not support captions');
    }
}

/**
 * Builder for document messages
 */
export class DocumentMessageBuilder extends BaseMediaBuilder<DocumentMediaObject> {
    /**
     * Set document filename
     */
    setFilename(filename: string): this {
        if (!filename || typeof filename !== 'string') {
            throw new Error('Filename must be a non-empty string');
        }
        this.media.filename = filename;
        return this;
    }
}

/**
 * Builder for sticker messages
 */
export class StickerMessageBuilder extends BaseMediaBuilder<StickerMediaObject> {
    // Sticker doesn't support caption
    setCaption(caption: string): this {
        throw new Error('Sticker messages do not support captions');
    }
}

/**
 * Factory class for common media patterns
 */
export class MediaMessageFactory {
    /**
     * Create an image with caption
     */
    static createImageWithCaption(linkOrId: string, caption: string, isId: boolean = false): ImageMediaObject {
        const builder = new ImageMessageBuilder();
        if (isId) {
            builder.setId(linkOrId);
        } else {
            builder.setLink(linkOrId);
        }
        return builder.setCaption(caption).build();
    }

    /**
     * Create a video with caption
     */
    static createVideoWithCaption(linkOrId: string, caption: string, isId: boolean = false): VideoMediaObject {
        const builder = new VideoMessageBuilder();
        if (isId) {
            builder.setId(linkOrId);
        } else {
            builder.setLink(linkOrId);
        }
        return builder.setCaption(caption).build();
    }

    /**
     * Create a document with filename
     */
    static createDocument(
        linkOrId: string,
        filename: string,
        caption?: string,
        isId: boolean = false,
    ): DocumentMediaObject {
        const builder = new DocumentMessageBuilder();
        if (isId) {
            builder.setId(linkOrId);
        } else {
            builder.setLink(linkOrId);
        }
        builder.setFilename(filename);
        if (caption) {
            builder.setCaption(caption);
        }
        return builder.build();
    }

    /**
     * Create an audio message
     */
    static createAudio(linkOrId: string, isId: boolean = false): AudioMediaObject {
        const builder = new AudioMessageBuilder();
        if (isId) {
            builder.setId(linkOrId);
        } else {
            builder.setLink(linkOrId);
        }
        return builder.build();
    }

    /**
     * Create a sticker message
     */
    static createSticker(linkOrId: string, isId: boolean = false): StickerMediaObject {
        const builder = new StickerMessageBuilder();
        if (isId) {
            builder.setId(linkOrId);
        } else {
            builder.setLink(linkOrId);
        }
        return builder.build();
    }
}
