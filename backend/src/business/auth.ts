import { JwtHeader } from 'jsonwebtoken';

interface JwtPayload {
    iss: string;
    sub: string;
    iat: number;
    exp: number;
}

interface Jwt {
    header: JwtHeader;
    payload: JwtPayload;
}

export {
    Jwt,
    JwtPayload
};
