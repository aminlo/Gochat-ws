package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func MakeJWT(userID string, tokenSecret string, expiresIn time.Duration) (string, error) {
	claims := &jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().UTC().Add(expiresIn)),
		Issuer:    "gochat-admin",
		IssuedAt:  jwt.NewNumericDate(time.Now().UTC()),
		Subject:   userID,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	strtoken, err := token.SignedString([]byte(tokenSecret))
	return strtoken, err

}
