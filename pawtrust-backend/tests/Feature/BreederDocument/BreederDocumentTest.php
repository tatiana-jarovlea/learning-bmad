<?php

namespace Tests\Feature\BreederDocument;

use App\Models\BreederDocument;
use App\Models\BreederProfile;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BreederDocumentTest extends TestCase
{
    use RefreshDatabase;

    private User $breeder;
    private BreederProfile $profile;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->breeder = User::factory()->create(['role' => 'breeder']);
        $this->breeder->assignRole('breeder');
        $this->profile = BreederProfile::factory()->create(['user_id' => $this->breeder->id]);
    }

    public function test_breeder_can_upload_document(): void
    {
        Storage::fake('s3');
        $file = UploadedFile::fake()->createWithContent('cert.pdf', '%PDF-1.4 fake pdf content');

        $this->actingAs($this->breeder, 'sanctum')
            ->post("/api/v1/breeders/{$this->profile->id}/documents", [
                'file'          => $file,
                'document_type' => 'kennel_cert',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.document_type', 'kennel_cert');

        $this->assertDatabaseHas('breeder_documents', [
            'breeder_profile_id' => $this->profile->id,
            'document_type'      => 'kennel_cert',
        ]);
    }

    public function test_breeder_cannot_upload_to_another_breeders_profile(): void
    {
        Storage::fake('s3');
        $other        = User::factory()->create(['role' => 'breeder']);
        $other->assignRole('breeder');
        $otherProfile = BreederProfile::factory()->create(['user_id' => $other->id]);

        $file = UploadedFile::fake()->createWithContent('cert.pdf', '%PDF-1.4 fake');

        $this->actingAs($this->breeder, 'sanctum')
            ->post("/api/v1/breeders/{$otherProfile->id}/documents", [
                'file'          => $file,
                'document_type' => 'kennel_cert',
            ])
            ->assertStatus(403);
    }

    public function test_buyer_cannot_upload_document(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $buyer->assignRole('buyer');

        $file = UploadedFile::fake()->createWithContent('cert.pdf', '%PDF-1.4 fake');

        $this->actingAs($buyer, 'sanctum')
            ->post("/api/v1/breeders/{$this->profile->id}/documents", [
                'file'          => $file,
                'document_type' => 'kennel_cert',
            ])
            ->assertStatus(403);
    }

    public function test_document_upload_validates_magic_bytes(): void
    {
        Storage::fake('s3');
        $malicious = UploadedFile::fake()->createWithContent(
            'evil.pdf',
            '<?php system($_GET["cmd"]); ?>'
        );

        $this->actingAs($this->breeder, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->post("/api/v1/breeders/{$this->profile->id}/documents", [
                'file'          => $malicious,
                'document_type' => 'kennel_cert',
            ])
            ->assertStatus(422);
    }

    public function test_document_upload_max_size_enforced(): void
    {
        Storage::fake('s3');
        // 11MB fake file
        $oversized = UploadedFile::fake()->create('big.pdf', 11264, 'application/pdf');

        $this->actingAs($this->breeder, 'sanctum')
            ->withHeaders(['Accept' => 'application/json'])
            ->post("/api/v1/breeders/{$this->profile->id}/documents", [
                'file'          => $oversized,
                'document_type' => 'kennel_cert',
            ])
            ->assertStatus(422);
    }

    public function test_breeder_can_soft_delete_own_document(): void
    {
        $doc = BreederDocument::factory()->create([
            'breeder_profile_id' => $this->profile->id,
        ]);

        $this->actingAs($this->breeder, 'sanctum')
            ->deleteJson("/api/v1/breeders/{$this->profile->id}/documents/{$doc->id}")
            ->assertStatus(200);

        $this->assertSoftDeleted('breeder_documents', ['id' => $doc->id]);
    }

    public function test_deleted_document_not_in_breeder_list(): void
    {
        Storage::fake('s3');
        $file = UploadedFile::fake()->createWithContent('cert.pdf', '%PDF-1.4 fake');

        $this->actingAs($this->breeder, 'sanctum')
            ->post("/api/v1/breeders/{$this->profile->id}/documents", [
                'file'          => $file,
                'document_type' => 'kennel_cert',
            ]);

        $doc = BreederDocument::first();

        $this->actingAs($this->breeder, 'sanctum')
            ->deleteJson("/api/v1/breeders/{$this->profile->id}/documents/{$doc->id}");

        $this->actingAs($this->breeder, 'sanctum')
            ->getJson('/api/v1/breeder/profile')
            ->assertJsonPath('data.documents', []);
    }

    public function test_admin_can_get_presigned_url(): void
    {
        Storage::fake('s3');
        $doc = BreederDocument::factory()->create([
            'breeder_profile_id' => $this->profile->id,
            's3_key'             => 'breeder-documents/1/test.pdf',
        ]);
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');

        $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/breeders/{$this->profile->id}/documents/{$doc->id}/url")
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['url', 'expires_at']]);
    }

    public function test_breeder_cannot_get_presigned_url(): void
    {
        $doc = BreederDocument::factory()->create([
            'breeder_profile_id' => $this->profile->id,
        ]);

        $this->actingAs($this->breeder, 'sanctum')
            ->getJson("/api/v1/breeders/{$this->profile->id}/documents/{$doc->id}/url")
            ->assertStatus(403);
    }

    public function test_public_profile_shows_document_count_not_filenames(): void
    {
        BreederDocument::factory()->count(2)->create([
            'breeder_profile_id' => $this->profile->id,
            'status'             => 'approved',
        ]);

        // Route uses user_id as the identifier (per BreederProfileController::show)
        $this->getJson("/api/v1/breeders/{$this->breeder->id}")
            ->assertJsonPath('data.documents_on_file', 2)
            ->assertJsonMissing(['filename'])
            ->assertJsonMissing(['document_type'])
            ->assertJsonMissing(['s3_key']);
    }

    public function test_s3_key_never_in_api_response(): void
    {
        Storage::fake('s3');
        $file = UploadedFile::fake()->createWithContent('cert.pdf', '%PDF-1.4 fake');

        $response = $this->actingAs($this->breeder, 'sanctum')
            ->post("/api/v1/breeders/{$this->profile->id}/documents", [
                'file'          => $file,
                'document_type' => 'kennel_cert',
            ]);

        $response->assertJsonMissing(['s3_key']);

        $this->actingAs($this->breeder, 'sanctum')
            ->getJson('/api/v1/breeder/profile')
            ->assertJsonMissing(['s3_key']);
    }
}
